import { useState, useCallback, useEffect, useRef } from 'react'
import { useWebSocket } from './useWebSocket'
import type { Driver, Guess } from '../types'
import { getDriverById } from '../utils/drivers'
import { loadPlayerName, savePlayerName } from '../utils/storage'

const API_BASE = 'https://api.f1-guess.online'

type GamePhase = 'lobby' | 'waiting' | 'playing' | 'finished'

interface OnlineGameState {
  phase: GamePhase
  roomId: string | null
  playerId: string | null
  playerName: string
  opponentName: string | null
  myGuesses: Guess[]
  opponentGuessCount: number
  opponentLatestFeedback: Record<string, any> | null
  targetDriverId: string | null
  remainingTime: number
  result: 'win' | 'lose' | 'tie' | null
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
  opponentLatestFeedback: null as Record<string, any> | null,
  targetDriverId: null as string | null,
  remainingTime: 120,
  result: null as 'win' | 'lose' | 'tie' | null,
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
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const handleMessage = useCallback((data: any) => {
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
          opponentLatestFeedback: data.feedback,
        }))
        break

      case 'timer_sync':
        setState((prev) => ({ ...prev, remainingTime: data.remaining }))
        break

      case 'game_end':
        setState((prev) => ({
          ...prev,
          phase: 'finished',
          result: data.result,
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
        setState((prev) => ({
          ...prev,
          phase: 'playing',
          myGuesses: [],
          opponentGuessCount: 0,
          opponentLatestFeedback: null,
          result: null,
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
        // Opponent left after game finished, go back to lobby
        setState((prev) => ({
          ...prev,
          phase: 'lobby',
          roomId: null,
          opponentName: null,
          error: '对手已离开房间',
        }))
        setWsUrl(null)
        break

      case 'opponent_left':
        setState((prev) => ({ ...prev, error: '对手已离开' }))
        break

      case 'error':
        setState((prev) => ({ ...prev, error: data.message }))
        break
    }
  }, [])

  const { isConnected, send } = useWebSocket(wsUrl, { onMessage: handleMessage })

  const createRoom = useCallback(
    async (playerName: string) => {
      try {
        setState((prev) => ({ ...prev, playerName, error: null }))
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
    setState((prev) => ({ ...prev, playerName, roomId, error: null }))
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

  const declineRestart = useCallback(() => {
    send({ type: 'decline_restart' })
    setState((prev) => ({
      ...prev,
      restartInvite: {
        ...prev.restartInvite,
        declined: true,
      },
    }))
  }, [send])

  const leaveRoom = useCallback(() => {
    send({ type: 'leave_room' })
    setWsUrl(null)
    setState(getInitialState())
  }, [send])

  const restart = useCallback(() => {
    send({ type: 'confirm_restart' })
    setState((prev) => ({
      ...prev,
      phase: 'waiting',
      myGuesses: [],
      opponentGuessCount: 0,
      opponentLatestFeedback: null,
      result: null,
      targetDriverId: null,
      remainingTime: 120,
    }))
  }, [send])

  const reset = useCallback(() => {
    setState(getInitialState())
    setWsUrl(null)
  }, [])

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
    declineRestart,
    leaveRoom,
    restart,
    reset,
    changePlayerName,
  }
}
