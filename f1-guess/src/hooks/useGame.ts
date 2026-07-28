import { useState, useCallback } from 'react'
import type { Driver, Guess, GameStatus } from '../types'
import { getRandomDriver } from '../utils/drivers'
import { compareDrivers } from '../utils/compare'

interface UseGameOptions {
  onWin?: (guessCount: number) => void
}

export function useGame(options?: UseGameOptions) {
  const [targetDriver, setTargetDriver] = useState<Driver>(() => getRandomDriver())
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [status, setStatus] = useState<GameStatus>('playing')

  const makeGuess = useCallback(
    (driver: Driver) => {
      if (status === 'won') return
      if (guesses.some((g) => g.driver.id === driver.id)) return

      const feedback = compareDrivers(driver, targetDriver)
      const newGuess: Guess = { driver, feedback }
      const newGuesses = [...guesses, newGuess]
      setGuesses(newGuesses)

      if (driver.id === targetDriver.id) {
        setStatus('won')
        options?.onWin?.(newGuesses.length)
      }
    },
    [targetDriver, guesses, status, options]
  )

  const resetGame = useCallback(() => {
    setTargetDriver((prev) => getRandomDriver(prev.id))
    setGuesses([])
    setStatus('playing')
  }, [])

  return {
    targetDriver,
    guesses,
    status,
    makeGuess,
    resetGame,
    guessCount: guesses.length,
  }
}
