import { useState, useCallback } from 'react'
import type { Driver, Guess, GameStatus } from '../types'
import { MAX_GUESSES } from '../types'
import { getRandomDriver } from '../utils/drivers'
import { compareDrivers } from '../utils/compare'

interface UseGameOptions {
  onWin?: (guessCount: number) => void
  onGiveUp?: (guessCount: number) => void
  onLose?: (guessCount: number) => void
}

export function useGame(options?: UseGameOptions) {
  const [targetDriver, setTargetDriver] = useState<Driver>(() => getRandomDriver())
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [status, setStatus] = useState<GameStatus>('playing')

  const makeGuess = useCallback(
    (driver: Driver) => {
      if (status !== 'playing') return
      if (guesses.some((g) => g.driver.id === driver.id)) return
      if (guesses.length >= MAX_GUESSES) return

      const feedback = compareDrivers(driver, targetDriver)
      const newGuess: Guess = { driver, feedback }
      const newGuesses = [...guesses, newGuess]
      setGuesses(newGuesses)

      if (driver.id === targetDriver.id) {
        setStatus('won')
        options?.onWin?.(newGuesses.length)
      } else if (newGuesses.length >= MAX_GUESSES) {
        setStatus('lost')
        options?.onLose?.(newGuesses.length)
      }
    },
    [targetDriver, guesses, status, options]
  )

  const giveUp = useCallback(() => {
    if (status !== 'playing') return
    setStatus('givenUp')
    options?.onGiveUp?.(guesses.length)
  }, [status, guesses.length, options])

  const resetGame = useCallback(() => {
    setTargetDriver((prev) => getRandomDriver(prev.id))
    setGuesses([])
    setStatus('playing')
  }, [])

  const remainingGuesses = MAX_GUESSES - guesses.length

  return {
    targetDriver,
    guesses,
    status,
    makeGuess,
    giveUp,
    resetGame,
    guessCount: guesses.length,
    remainingGuesses,
    maxGuesses: MAX_GUESSES,
  }
}
