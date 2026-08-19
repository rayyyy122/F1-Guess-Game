import type {
  Player,
  RoomState,
  ClientMessage,
  ServerMessage,
  GameMode,
} from './types'
import type { Env } from './index'
import { generatePlayerId, getRandomDriver, getDriversByMode } from './utils'
import { compareDrivers } from './compare'

const GAME_DURATION = 120
const RECONNECT_WINDOW = 30_000
// 等待/结算状态的闲置超时：超时后销毁房间，避免 DO 持续计费
const ROOM_IDLE_TIMEOUT = 5 * 60 * 1000

export class GameRoom implements DurableObject {
  private state: DurableObjectState
  private env: Env
  private roomState: RoomState | null = null
  private sessions: Map<WebSocket, string> = new Map()
  private timerInterval: number | null = null

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
  }

  // 向全局统计 DO 上报计数（异步不阻塞主流程）
  private track(key: string, delta = 1) {
    try {
      const id = this.env.STATS.idFromName('global')
      const stub = this.env.STATS.get(id)
      this.state.waitUntil(
        stub.fetch('https://stats.internal/incr', {
          method: 'POST',
          body: JSON.stringify({ key, delta }),
        })
      )
    } catch {
      // 统计失败不影响游戏
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair()
      const [client, server] = Object.values(pair)

      const playerId = url.searchParams.get('playerId')
      const playerName = url.searchParams.get('playerName') || 'Player'
      const roomId = url.searchParams.get('roomId') || this.state.id.toString()
      const mode: GameMode = url.searchParams.get('mode') === 'easy' ? 'easy' : 'classic'
      const isReconnect = url.searchParams.get('reconnect') === '1'

      await this.handleSession(server, playerId, playerName, roomId, mode, isReconnect)

      return new Response(null, { status: 101, webSocket: client })
    }

    if (url.pathname === '/state') {
      await this.loadState()
      return new Response(JSON.stringify(this.roomState), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response('Not found', { status: 404 })
  }

  async handleSession(
    ws: WebSocket,
    playerId: string | null,
    playerName: string,
    roomId: string,
    mode: GameMode,
    isReconnect: boolean
  ) {
    ws.accept()
    await this.loadState()

    let currentPlayerId = playerId

    if (!this.roomState) {
      if (isReconnect) {
        // 房间已销毁，会话过期
        this.send(ws, { type: 'error', code: 'ROOM_EXPIRED', message: '房间已过期，请重新加入' })
        ws.close(1008, 'Room expired')
        return
      }
      this.roomState = {
        id: roomId,
        status: 'waiting',
        mode,
        players: {},
        targetDriverId: null,
        startTime: null,
        endTime: null,
        duration: GAME_DURATION,
        winner: null,
        createdAt: Date.now(),
        restartRequests: [],
      }
      // 等待超时：5 分钟无人加入自动销毁（见 alarm()）
      await this.state.storage.setAlarm(Date.now() + ROOM_IDLE_TIMEOUT)
    }

    // 兼容旧房间（无 mode 字段），默认经典版
    this.roomState.mode ??= 'classic'

    if (!currentPlayerId || !this.roomState.players[currentPlayerId]) {
      if (isReconnect) {
        // 重连但房间里没有该玩家，会话过期
        this.send(ws, { type: 'error', code: 'ROOM_EXPIRED', message: '房间已过期，请重新加入' })
        ws.close(1008, 'Room expired')
        return
      }
      if (Object.keys(this.roomState.players).length >= 2) {
        this.send(ws, { type: 'error', code: 'ROOM_FULL', message: '房间已满' })
        ws.close(1008, 'Room full')
        return
      }

      // 优先使用客户端带来的 playerId（刷新/断线后才能以同一身份重连）
      currentPlayerId = currentPlayerId || generatePlayerId()
      const player: Player = {
        id: currentPlayerId,
        name: playerName,
        status: 'playing',
        guessCount: 0,
        guesses: [],
        connected: true,
        lastSeen: Date.now(),
      }
      this.roomState.players[currentPlayerId] = player

      const opponentId = Object.keys(this.roomState.players).find((id) => id !== currentPlayerId)

      this.sessions.set(ws, currentPlayerId)

      this.send(ws, {
        type: 'room_joined',
        roomId: this.roomState.id,
        playerId: currentPlayerId,
        opponent: opponentId
          ? { name: this.roomState.players[opponentId].name }
          : { name: '' },
        mode: this.roomState.mode,
      })

      if (opponentId) {
        this.broadcastTo(ws, {
          type: 'opponent_joined',
          opponent: { name: playerName },
        })
        await this.startGame()
      }
    } else {
      // 重连：恢复连接并同步完整对局状态
      const player = this.roomState.players[currentPlayerId]
      player.connected = true
      player.lastSeen = Date.now()

      this.sessions.set(ws, currentPlayerId)

      const opponentId = Object.keys(this.roomState.players).find((id) => id !== currentPlayerId)
      const opponent = opponentId ? this.roomState.players[opponentId] : undefined

      this.send(ws, {
        type: 'room_joined',
        roomId: this.roomState.id,
        playerId: currentPlayerId,
        opponent: opponentId
          ? { name: this.roomState.players[opponentId].name }
          : { name: '' },
        mode: this.roomState.mode,
      })

      this.send(ws, {
        type: 'state_sync',
        phase: this.roomState.status,
        mode: this.roomState.mode,
        yourGuesses: player.guesses.map((g) => ({ driverId: g.driverId, feedback: g.feedback })),
        opponentGuesses: (opponent?.guesses ?? []).map((g) => g.feedback),
      })

      if (this.roomState.status === 'playing') {
        this.send(ws, {
          type: 'game_start',
          duration: Math.max(0, Math.floor((this.roomState.endTime! - Date.now()) / 1000)),
          mode: this.roomState.mode,
        })
      } else if (this.roomState.status === 'finished') {
        // 重发结算结果（结算弹窗在刷新后会丢失）
        const winnerId = this.roomState.winner
        let result: 'win' | 'lose' | 'tie'
        if (winnerId) {
          result = winnerId === currentPlayerId ? 'win' : 'lose'
        } else if (player.status === 'won' && opponent?.status !== 'won') {
          result = 'win'
        } else if (player.status !== 'won' && opponent?.status === 'won') {
          result = 'lose'
        } else if (player.guessCount < (opponent?.guessCount ?? Infinity)) {
          result = 'win'
        } else if (player.guessCount > (opponent?.guessCount ?? -1)) {
          result = 'lose'
        } else {
          result = 'tie'
        }
        this.send(ws, {
          type: 'game_end',
          result,
          reason: (this.roomState.endReason ?? 'guessed') as any,
          yourGuesses: player.guessCount,
          opponentGuesses: opponent?.guessCount ?? 0,
          targetDriverId: this.roomState.targetDriverId!,
          duration: 0,
        })
      }
    }

    await this.saveState()

    ws.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string) as ClientMessage
        await this.handleMessage(ws, currentPlayerId!, message)
      } catch (err) {
        console.error('Message error:', err)
        this.send(ws, { type: 'error', code: 'INVALID_MESSAGE', message: '无效消息' })
      }
    })

    ws.addEventListener('close', async () => {
      this.sessions.delete(ws)
      await this.handleDisconnect(currentPlayerId!)
    })
  }

  async handleMessage(ws: WebSocket, playerId: string, message: ClientMessage) {
    if (!this.roomState) return

    const player = this.roomState.players[playerId]
    if (!player) return

    player.lastSeen = Date.now()

    switch (message.type) {
      case 'make_guess':
        await this.handleGuess(playerId, message.driverId)
        break
      case 'give_up':
        await this.handleGiveUp(playerId)
        break
      case 'request_restart':
        await this.handleRestartRequest(playerId)
        break
      case 'accept_restart':
        await this.handleRestartAccept(playerId)
        break
      case 'decline_restart':
        await this.handleRestartDecline(playerId)
        break
      case 'leave_room':
        await this.handleLeaveRoom(playerId)
        break
      case 'ping':
        this.send(ws, { type: 'pong' })
        break
    }

    await this.saveState()
  }

  async handleGuess(playerId: string, driverId: string) {
    if (!this.roomState || this.roomState.status !== 'playing') return

    const player = this.roomState.players[playerId]
    if (!player || player.status !== 'playing') return

    const pool = getDriversByMode(this.roomState.mode ?? 'classic')
    const targetDriver = pool.find((d) => d.id === this.roomState!.targetDriverId)
    // 猜测必须在房间模式池子内，池外猜测直接拒绝
    const guessDriver = pool.find((d) => d.id === driverId)
    if (!targetDriver || !guessDriver) return

    const feedback = compareDrivers(guessDriver, targetDriver)
    const isCorrect = driverId === this.roomState.targetDriverId

    player.guessCount++
    player.guesses.push({ driverId, feedback, timestamp: Date.now() })
    this.track('totalGuesses')

    this.sendTo(playerId, {
      type: 'guess_result',
      driverId,
      feedback,
      isCorrect,
    })

    if (isCorrect) {
      player.status = 'won'
      await this.endGame(playerId, 'guessed')
    } else if (player.guessCount >= 8) {
      player.status = 'lost'
      const opponent = this.getOpponent(playerId)
      if (opponent && opponent.status !== 'playing') {
        await this.endGame(null, 'both_finished')
      }
    }

    this.broadcastExcept(playerId, {
      type: 'opponent_guess',
      guessCount: player.guessCount,
      feedback,
    })
  }

  async handleGiveUp(playerId: string) {
    if (!this.roomState || this.roomState.status !== 'playing') return

    const player = this.roomState.players[playerId]
    if (!player || player.status !== 'playing') return

    player.status = 'given_up'
    const opponent = this.getOpponent(playerId)

    if (opponent && opponent.status === 'playing') {
      await this.endGame(opponent.id, 'guessed')
    } else {
      await this.endGame(null, 'both_finished')
    }
  }

  async handleDisconnect(playerId: string) {
    if (!this.roomState) return

    const player = this.roomState.players[playerId]
    if (!player) return

    player.connected = false
    await this.saveState()

    setTimeout(async () => {
      await this.loadState()
      const p = this.roomState?.players[playerId]
      // 30 秒重连窗口内未回来即判负，直接结束游戏
      // （不再检查 lastSeen，避免因最近有操作而导致永远不结算）
      if (p && !p.connected) {
        if (this.roomState?.status === 'playing') {
          const opponent = this.getOpponent(playerId)
          if (opponent) {
            await this.endGame(opponent.id, 'opponent_disconnect')
          }
        }
      }
    }, RECONNECT_WINDOW + 1000)
  }

  async handleRestartRequest(playerId: string) {
    if (!this.roomState || this.roomState.status !== 'finished') return

    // Add this player to restart requests
    if (!this.roomState.restartRequests.includes(playerId)) {
      this.roomState.restartRequests.push(playerId)
    }

    const player = this.roomState.players[playerId]

    // Notify the opponent
    this.broadcastExcept(playerId, {
      type: 'opponent_request_restart',
      playerName: player.name,
    })

    // If both players have requested, automatically start the game
    if (this.roomState.restartRequests.length === 2) {
      await this.restart()
    }
  }

  async handleRestartAccept(playerId: string) {
    if (!this.roomState || this.roomState.status !== 'finished') return

    // Add this player to restart requests
    if (!this.roomState.restartRequests.includes(playerId)) {
      this.roomState.restartRequests.push(playerId)
    }

    const player = this.roomState.players[playerId]

    // Notify the requestor that restart was accepted
    this.broadcastExcept(playerId, {
      type: 'restart_accepted',
      acceptedBy: player.name,
    })

    // If both players have requested, start the game
    if (this.roomState.restartRequests.length === 2) {
      await this.restart()
    }
  }

  async handleRestartDecline(playerId: string) {
    if (!this.roomState || this.roomState.status !== 'finished') return

    // Clear restart requests
    this.roomState.restartRequests = []

    // Notify the opponent that restart was declined
    this.broadcastExcept(playerId, {
      type: 'restart_declined',
    })
  }

  async handleLeaveRoom(playerId: string) {
    if (!this.roomState) return

    const player = this.roomState.players[playerId]
    if (!player) return

    // Notify the opponent
    this.broadcastExcept(playerId, {
      type: 'opponent_left',
    })

    // 游戏进行中有人离开，剩余玩家直接获胜（先结算再移除玩家，
    // 这样结算数据完整，剩余玩家能看到胜利弹窗而不是仅仅被踢回大厅）
    if (this.roomState.status === 'playing') {
      const opponent = this.getOpponent(playerId)
      if (opponent) {
        await this.endGame(opponent.id, 'opponent_disconnect')
      }
    }

    // Remove this player from the room
    delete this.roomState.players[playerId]

    // Check if there are still players in the room
    const remainingPlayers = Object.keys(this.roomState.players)

    if (remainingPlayers.length === 0) {
      // No players left, close the room
      await this.state.storage.delete('roomState')
      this.roomState = null
    } else {
      // One player left, notify them to go back to waiting and close their connection
      const remainingPlayerId = remainingPlayers[0]
      const remainingWs = this.getWebSocketForPlayer(remainingPlayerId)

      if (remainingWs) {
        // Send room_closed message
        this.send(remainingWs, {
          type: 'room_closed',
        })
      }

      // Immediately remove from sessions to prevent any further messages
      // This must happen before any other operations that might trigger broadcasts
      this.sessions.clear()

      // Now close the WebSocket
      if (remainingWs) {
        try {
          remainingWs.close(1000, 'Room closed - opponent left')
        } catch (err) {
          // Ignore close errors
        }
      }

      // Delete the remaining player from room state
      delete this.roomState.players[remainingPlayerId]

      // Close the room completely
      await this.state.storage.delete('roomState')
      this.roomState = null
    }
  }

  async startGame() {
    if (!this.roomState || this.roomState.status !== 'waiting') return

    this.roomState.status = 'playing'
    const pool = getDriversByMode(this.roomState.mode ?? 'classic')
    this.roomState.targetDriverId = getRandomDriver(pool).id
    this.roomState.startTime = Date.now()
    this.roomState.endTime = Date.now() + GAME_DURATION * 1000
    this.roomState.restartRequests = []
    this.track('gamesStarted')
    // 对局开始，取消闲置超时
    await this.state.storage.deleteAlarm()

    this.broadcast({
      type: 'game_start',
      duration: GAME_DURATION,
      mode: this.roomState.mode ?? 'classic',
    })

    this.startTimer()
    await this.saveState()
  }

  startTimer() {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval)
    }

    this.timerInterval = setInterval(async () => {
      if (!this.roomState || this.roomState.status !== 'playing') {
        if (this.timerInterval !== null) clearInterval(this.timerInterval)
        return
      }

      const remaining = Math.max(0, Math.floor((this.roomState.endTime! - Date.now()) / 1000))

      this.broadcast({ type: 'timer_sync', remaining })

      if (remaining <= 0) {
        if (this.timerInterval !== null) clearInterval(this.timerInterval)
        await this.endGame(null, 'timeout')
      }
    }, 1000) as unknown as number
  }

  async endGame(winnerId: string | null, reason: string) {
    if (!this.roomState || this.roomState.status === 'finished') return

    this.roomState.status = 'finished'
    this.roomState.winner = winnerId
    this.roomState.endReason = reason
    this.track('gamesFinished')
    // 结算后闲置 5 分钟自动销毁房间（见 alarm()）
    await this.state.storage.setAlarm(Date.now() + ROOM_IDLE_TIMEOUT)

    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }

    const players = Object.values(this.roomState.players)
    const duration = this.roomState.startTime
      ? Math.floor((Date.now() - this.roomState.startTime) / 1000)
      : 0

    for (const player of players) {
      const opponent = this.getOpponent(player.id)
      let result: 'win' | 'lose' | 'tie'

      if (winnerId === null) {
        if (player.status === 'won' && opponent?.status !== 'won') result = 'win'
        else if (player.status !== 'won' && opponent?.status === 'won') result = 'lose'
        else if (player.guessCount < (opponent?.guessCount ?? Infinity)) result = 'win'
        else if (player.guessCount > (opponent?.guessCount ?? -1)) result = 'lose'
        else result = 'tie'
      } else {
        result = player.id === winnerId ? 'win' : 'lose'
      }

      this.sendTo(player.id, {
        type: 'game_end',
        result,
        reason: reason as any,
        yourGuesses: player.guessCount,
        opponentGuesses: opponent?.guessCount ?? 0,
        targetDriverId: this.roomState.targetDriverId!,
        duration,
      })
    }

    await this.saveState()
  }

  async restart() {
    if (!this.roomState) return

    for (const player of Object.values(this.roomState.players)) {
      player.status = 'playing'
      player.guessCount = 0
      player.guesses = []
    }

    this.roomState.status = 'waiting'
    this.roomState.winner = null
    this.roomState.targetDriverId = null
    this.roomState.startTime = null
    this.roomState.endTime = null
    this.roomState.restartRequests = []

    await this.startGame()
    this.broadcast({ type: 'game_restart' })
  }

  getOpponent(playerId: string): Player | undefined {
    if (!this.roomState) return undefined
    const opponentId = Object.keys(this.roomState.players).find((id) => id !== playerId)
    return opponentId ? this.roomState.players[opponentId] : undefined
  }

  getWebSocketForPlayer(playerId: string): WebSocket | undefined {
    for (const [ws, pid] of this.sessions) {
      if (pid === playerId) {
        return ws
      }
    }
    return undefined
  }

  send(ws: WebSocket, message: ServerMessage) {
    try {
      // 只对 OPEN 状态的 WebSocket 发送消息
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
      }
    } catch (err) {
      console.error('Send error:', err)
    }
  }

  sendTo(playerId: string, message: ServerMessage) {
    for (const [ws, pid] of this.sessions) {
      if (pid === playerId) {
        this.send(ws, message)
      }
    }
  }

  broadcast(message: ServerMessage) {
    for (const ws of this.sessions.keys()) {
      this.send(ws, message)
    }
  }

  broadcastExcept(playerId: string, message: ServerMessage) {
    for (const [ws, pid] of this.sessions) {
      if (pid !== playerId) {
        this.send(ws, message)
      }
    }
  }

  broadcastTo(excludeWs: WebSocket, message: ServerMessage) {
    for (const ws of this.sessions.keys()) {
      if (ws !== excludeWs) {
        this.send(ws, message)
      }
    }
  }

  async loadState() {
    if (!this.roomState) {
      this.roomState = (await this.state.storage.get<RoomState>('roomState')) || null
    }
  }

  // 闲置超时销毁：等待中 5 分钟无人加入 / 结算后闲置 5 分钟
  async alarm() {
    await this.loadState()
    if (!this.roomState) return

    if (this.roomState.status === 'waiting') {
      for (const ws of this.sessions.keys()) {
        this.send(ws, {
          type: 'error',
          code: 'ROOM_TIMEOUT',
          message: '房间超时未开始，已自动关闭',
        })
      }
    } else if (this.roomState.status === 'finished') {
      for (const ws of this.sessions.keys()) {
        this.send(ws, { type: 'room_closed' })
      }
    } else {
      // playing 状态不应触发（对局开始时已取消 alarm）
      return
    }

    for (const ws of this.sessions.keys()) {
      try {
        ws.close(1000, 'Room idle timeout')
      } catch {
        // 忽略关闭错误
      }
    }
    this.sessions.clear()
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
    await this.state.storage.delete('roomState')
    this.roomState = null
  }

  async saveState() {
    if (this.roomState) {
      await this.state.storage.put('roomState', this.roomState)
    }
  }
}
