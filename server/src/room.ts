import type {
  Player,
  RoomState,
  ClientMessage,
  ServerMessage,
  Driver,
} from './types'
import { generatePlayerId, getRandomDriver } from './utils'
import driversData from './drivers.json'

const drivers = driversData as Driver[]
const GAME_DURATION = 120
const RECONNECT_WINDOW = 30_000

export class GameRoom implements DurableObject {
  private state: DurableObjectState
  private roomState: RoomState | null = null
  private sessions: Map<WebSocket, string> = new Map()
  private timerInterval: number | null = null

  constructor(state: DurableObjectState) {
    this.state = state
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair()
      const [client, server] = Object.values(pair)

      const playerId = url.searchParams.get('playerId')
      const playerName = url.searchParams.get('playerName') || 'Player'
      const roomId = url.searchParams.get('roomId') || this.state.id.toString()

      await this.handleSession(server, playerId, playerName, roomId)

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

  async handleSession(ws: WebSocket, playerId: string | null, playerName: string, roomId: string) {
    ws.accept()
    await this.loadState()

    let currentPlayerId = playerId

    if (!this.roomState) {
      this.roomState = {
        id: roomId,
        status: 'waiting',
        players: {},
        targetDriverId: null,
        startTime: null,
        endTime: null,
        duration: GAME_DURATION,
        winner: null,
        createdAt: Date.now(),
      }
    }

    if (!currentPlayerId || !this.roomState.players[currentPlayerId]) {
      if (Object.keys(this.roomState.players).length >= 2) {
        this.send(ws, { type: 'error', code: 'ROOM_FULL', message: '房间已满' })
        ws.close(1008, 'Room full')
        return
      }

      currentPlayerId = generatePlayerId()
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
      })

      if (opponentId) {
        this.broadcastTo(ws, {
          type: 'opponent_joined',
          opponent: { name: playerName },
        })
        await this.startGame()
      }
    } else {
      const player = this.roomState.players[currentPlayerId]
      player.connected = true
      player.lastSeen = Date.now()

      this.sessions.set(ws, currentPlayerId)

      const opponentId = Object.keys(this.roomState.players).find((id) => id !== currentPlayerId)

      this.send(ws, {
        type: 'room_joined',
        roomId: this.roomState.id,
        playerId: currentPlayerId,
        opponent: opponentId
          ? { name: this.roomState.players[opponentId].name }
          : { name: '' },
      })

      if (this.roomState.status === 'playing') {
        this.send(ws, {
          type: 'game_start',
          duration: Math.max(0, Math.floor((this.roomState.endTime! - Date.now()) / 1000)),
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
        await this.handleGuess(playerId, message.driverId, message.feedback)
        break
      case 'give_up':
        await this.handleGiveUp(playerId)
        break
      case 'request_restart':
        this.broadcastTo(ws, { type: 'opponent_request_restart' })
        break
      case 'confirm_restart':
        await this.restart()
        break
      case 'ping':
        this.send(ws, { type: 'pong' })
        break
    }

    await this.saveState()
  }

  async handleGuess(playerId: string, driverId: string, feedback: Record<string, string>) {
    if (!this.roomState || this.roomState.status !== 'playing') return

    const player = this.roomState.players[playerId]
    if (!player || player.status !== 'playing') return

    const isCorrect = driverId === this.roomState.targetDriverId
    player.guessCount++
    player.guesses.push({ driverId, feedback, timestamp: Date.now() })

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
      if (p && !p.connected && Date.now() - p.lastSeen > RECONNECT_WINDOW) {
        if (this.roomState?.status === 'playing') {
          const opponent = this.getOpponent(playerId)
          if (opponent) {
            await this.endGame(opponent.id, 'opponent_disconnect')
          }
        }
      }
    }, RECONNECT_WINDOW + 1000)
  }

  async startGame() {
    if (!this.roomState || this.roomState.status !== 'waiting') return

    this.roomState.status = 'playing'
    this.roomState.targetDriverId = getRandomDriver(drivers).id
    this.roomState.startTime = Date.now()
    this.roomState.endTime = Date.now() + GAME_DURATION * 1000

    this.broadcast({
      type: 'game_start',
      duration: GAME_DURATION,
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

    await this.startGame()
    this.broadcast({ type: 'game_restart' })
  }

  getOpponent(playerId: string): Player | undefined {
    if (!this.roomState) return undefined
    const opponentId = Object.keys(this.roomState.players).find((id) => id !== playerId)
    return opponentId ? this.roomState.players[opponentId] : undefined
  }

  send(ws: WebSocket, message: ServerMessage) {
    try {
      ws.send(JSON.stringify(message))
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

  async saveState() {
    if (this.roomState) {
      await this.state.storage.put('roomState', this.roomState)
    }
  }
}
