import { useState, useCallback, useEffect, useRef } from 'react'
import { useWebSocket } from './useWebSocket'
import type { Driver, Guess, GuessFeedback } from '../types'
import { getDriverById } from '../utils/drivers'
import { loadPlayerName, savePlayerName } from '../utils/storage'
import { API_BASE } from '../utils/api'

type GamePhase = 'lobby' | 'waiting' | 'playing' | 'finished'

interface OnlineGameState {
  phase: GamePhase
  roomId: string | null
  playerId: string | null
  playerName: string
  opponentName: string | null
  myGuesses: Guess[]
  opponentGuessCount: number
  opponentGuesses: GuessFeedback[]
  targetDriverId: string | null
  remainingTime: number
  result: 'win' | 'lose' | 'tie' | null
  endReason: string | null
  error: string | null
  // 再来一局邀请状态
  restartInvite: {
    from: string | null
    accepted: boolean
    declined: boolean
    iRequested: boolean
  }
}

const getInitialState = () => ({
  phase: 'lobby' as GamePhase,
  roomId: null as string | null,
  playerId: null as string | null,
  playerName: loadPlayerName(),
  opponentName: null as string | null,
  myGuesses: [] as Guess[],
  opponentGuessCount: 0,
  opponentGuesses: [] as GuessFeedback[],
  targetDriverId: null as string | null,
  remainingTime: 120,
  result: null as 'win' | 'lose' | 'tie' | null,
  endReason: null as string | null,
  error: null as string | null,
  restartInvite: {
    from: null as string | null,
    accepted: false,
    declined: false,
    iRequested: false,
  },
})

export function useOnlineGame() {
  const [state, setState] = useState<OnlineGameState>(getInitialState)
  const [wsUrl, setWsUrl] = useState<string | null>(null)
  const isLeavingRef = useRef(false)
  // 游戏是否已结算。不能用 state 判断：game_end 和 room_closed 几乎同时到达，
  // setState 是异步的，处理 room_closed 时 state 可能还没更新
  const finishedRef = useRef(false)
  const closeWsRef = useRef<(() => void) | null>(null)
  const errorTimerRef = useRef<number | null>(null)

  // 错误消息 3 秒后自动消失
  useEffect(() => {
    if (state.error) {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
      errorTimerRef.current = window.setTimeout(() => {
        setState((prev) => ({ ...prev, error: null }))
      }, 3000)
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    }
  }, [state.error])

  const handleMessage = useCallback((data: any) => {
    // 如果正在离开房间，忽略所有消息
    if (isLeavingRef.current) return

    switch (data.type) {
      case 'room_joined':
        setState((prev) => ({
          ...prev,
          phase: 'waiting',
          roomId: data.roomId,
          playerId: data.playerId,
          opponentName: data.opponent.name || null,
        }))
        break

      case 'opponent_joined':
        setState((prev) => ({ ...prev, opponentName: data.opponent.name }))
        break

      case 'game_start':
        setState((prev) => ({
          ...prev,
          phase: 'playing',
          remainingTime: data.duration,
        }))
        break

      case 'guess_result': {
        const driver = getDriverById(data.driverId)
        if (driver) {
          setState((prev) => ({
            ...prev,
            myGuesses: [...prev.myGuesses, { driver, feedback: data.feedback }],
          }))
        }
        break
      }

      case 'opponent_guess':
        setState((prev) => ({
          ...prev,
          opponentGuessCount: data.guessCount,
          opponentGuesses: [...prev.opponentGuesses, data.feedback],
        }))
        break

      case 'timer_sync':
        setState((prev) => ({ ...prev, remainingTime: data.remaining }))
        break

      case 'game_end':
        finishedRef.current = true
        setState((prev) => ({
          ...prev,
          phase: 'finished',
          result: data.result,
          endReason: data.reason ?? null,
          targetDriverId: data.targetDriverId,
          restartInvite: {
            from: null,
            accepted: false,
            declined: false,
            iRequested: false,
          },
        }))
        break

      case 'opponent_request_restart':
        setState((prev) => ({
          ...prev,
          restartInvite: {
            from: data.playerName,
            accepted: false,
            declined: false,
            iRequested: false,
          },
        }))
        break

      case 'restart_accepted':
        // Opponent accepted our restart request, game will start soon
        setState((prev) => ({
          ...prev,
          restartInvite: {
            ...prev.restartInvite,
            accepted: true,
          },
        }))
        break

      case 'restart_declined':
        setState((prev) => ({
          ...prev,
          restartInvite: {
            ...prev.restartInvite,
            declined: true,
          },
        }))
        break

      case 'game_restart':
        // Reset game state for new round
        finishedRef.current = false
        setState((prev) => ({
          ...prev,
          phase: 'playing',
          myGuesses: [],
          opponentGuessCount: 0,
          opponentGuesses: [],
          result: null,
          endReason: null,
          targetDriverId: null,
          remainingTime: data.duration || 120,
          restartInvite: {
            from: null,
            accepted: false,
            declined: false,
            iRequested: false,
          },
        }))
        break

      case 'room_closed':
        // 对手离开，房间被服务端关闭
        closeWsRef.current?.()
        setWsUrl(null)
        // 如果本局已结算（对手中途离开时我们会先收到 game_end），
        // 保留结算弹窗，不重置状态；但房间已销毁，标记对手离开
        // 让结算弹窗隐藏「再来一局」
        if (finishedRef.current) {
          setState((prev) => ({ ...prev, endReason: 'opponent_disconnect' }))
          break
        }
        // 完全重置状态，除了 playerName
        setState((prev) => {
          const initialState = getInitialState()
          return {
            ...initialState,
            playerName: prev.playerName,
            error: '对手已离开房间',
          }
        })
        break

      case 'opponent_left':
        setState((prev) => ({ ...prev, error: '对手已离开' }))
        break

      case 'error':
        setState((prev) => ({ ...prev, error: data.message }))
        break
    }
  }, [])

  const { isConnected, send, close } = useWebSocket(wsUrl, { onMessage: handleMessage })

  useEffect(() => {
    closeWsRef.current = close
  }, [close])

  const createRoom = useCallback(
    async (playerName: string) => {
      try {
        // 重置离开标志，允许处理新消息
        isLeavingRef.current = false
        finishedRef.current = false

        // 重置所有游戏状态，保留 playerName
        const initialState = getInitialState()
        setState({
          ...initialState,
          playerName,
          error: null,
        })
        const response = await fetch(
          `${API_BASE}/create?playerName=${encodeURIComponent(playerName)}`,
          { method: 'POST' }
        )
        if (!response.ok) throw new Error('创建房间失败')
        const data = await response.json()

        setState((prev) => ({ ...prev, roomId: data.roomId }))
        const wsUrl = `${API_BASE.replace('https', 'wss')}/room/${data.roomId}?playerName=${encodeURIComponent(playerName)}`
        setWsUrl(wsUrl)
      } catch (err) {
        setState((prev) => ({ ...prev, error: '创建房间失败，请重试' }))
      }
    },
    []
  )

  const joinRoom = useCallback((roomId: string, playerName: string) => {
    // 重置离开标志，允许处理新消息
    isLeavingRef.current = false
    finishedRef.current = false

    // 重置所有游戏状态，保留 playerName 和 roomId
    const initialState = getInitialState()
    setState({
      ...initialState,
      playerName,
      roomId: roomId.toUpperCase(),
      error: null,
    })
    const wsUrl = `${API_BASE.replace('https', 'wss')}/room/${roomId.toUpperCase()}?playerName=${encodeURIComponent(playerName)}`
    setWsUrl(wsUrl)
  }, [])

  const makeGuess = useCallback(
    (driver: Driver) => {
      send({
        type: 'make_guess',
        driverId: driver.id,
      })
    },
    [send]
  )

  const giveUp = useCallback(() => {
    send({ type: 'give_up' })
  }, [send])

  const requestRestart = useCallback(() => {
    send({ type: 'request_restart' })
    setState((prev) => ({
      ...prev,
      restartInvite: {
        ...prev.restartInvite,
        iRequested: true,
      },
    }))
  }, [send])

  const acceptRestart = useCallback(() => {
    send({ type: 'accept_restart' })
  }, [send])

  const leaveRoom = useCallback(() => {
    isLeavingRef.current = true
    finishedRef.current = false
    send({ type: 'leave_room' })

    // 立即重置状态到初始状态，清除所有游戏数据
    setState((prev) => {
      const initialState = getInitialState()
      return {
        ...initialState,
        playerName: prev.playerName,
      }
    })

    // 关闭 WebSocket 连接并禁用自动重连
    closeWsRef.current?.()
    setWsUrl(null)

    // 重置离开标志
    isLeavingRef.current = false
  }, [send])

  const changePlayerName = useCallback((newName: string) => {
    savePlayerName(newName)
    setState((prev) => ({ ...prev, playerName: newName }))
  }, [])

  return {
    ...state,
    isConnected,
    createRoom,
    joinRoom,
    makeGuess,
    giveUp,
    requestRestart,
    acceptRestart,
    leaveRoom,
    changePlayerName,
  }
}
