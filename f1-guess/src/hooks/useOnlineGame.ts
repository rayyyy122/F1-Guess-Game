import { useState, useCallback, useEffect, useRef } from 'react'
import { useWebSocket } from './useWebSocket'
import type { Driver, Guess } from '../types'
import { compareDrivers } from '../utils/compare'
import { getDriverById } from '../utils/drivers'

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
  opponentLatestFeedback: Record<string, string> | null
  targetDriverId: string | null
  remainingTime: number
  result: 'win' | 'lose' | 'tie' | null
  error: string | null
}

const initialState: OnlineGameState = {
  phase: 'lobby',
  roomId: null,
  playerId: null,
  playerName: '',
  opponentName: null,
  myGuesses: [],
  opponentGuessCount: 0,
  opponentLatestFeedback: null,
  targetDriverId: null,
  remainingTime: 120,
  result: null,
  error: null,
}

export function useOnlineGame() {
  const [state, setState] = useState<OnlineGameState>(initialState)
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
        }))
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
      if (!stateRef.current.targetDriverId) {
        const feedback = compareDrivers(driver, getDriverById(driver.id)!)
        setState((prev) => ({
          ...prev,
          myGuesses: [...prev.myGuesses, { driver, feedback }],
        }))
      }

      const targetDriver = stateRef.current.targetDriverId
        ? getDriverById(stateRef.current.targetDriverId)
        : null

      const feedback = targetDriver ? compareDrivers(driver, targetDriver) : compareDrivers(driver, driver)

      send({
        type: 'make_guess',
        driverId: driver.id,
        feedback: {
          nationality: feedback.nationality,
          team: feedback.team,
          number: feedback.number.type,
          championships: feedback.championships.type,
          podiums: feedback.podiums.type,
          wins: feedback.wins.type,
          debutYear: feedback.debutYear.type,
          status: feedback.status,
        },
      })

      setState((prev) => ({
        ...prev,
        myGuesses: [...prev.myGuesses, { driver, feedback }],
      }))
    },
    [send]
  )

  const giveUp = useCallback(() => {
    send({ type: 'give_up' })
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
    setState(initialState)
    setWsUrl(null)
  }, [])

  return {
    ...state,
    isConnected,
    createRoom,
    joinRoom,
    makeGuess,
    giveUp,
    restart,
    reset,
  }
}
