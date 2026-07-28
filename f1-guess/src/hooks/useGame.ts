import { useState, useCallback } from 'react'
import type { Driver, Guess, GameStatus } from '../types'
import { getRandomDriver } from '../utils/drivers'
import { compareDrivers } from '../utils/compare'

export function useGame() {
  const [targetDriver, setTargetDriver] = useState<Driver>(() => getRandomDriver())
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [status, setStatus] = useState<GameStatus>('playing')

  const makeGuess = useCallback(
    (driver: Driver) => {
      if (status === 'won') return
      if (guesses.some((g) => g.driver.id === driver.id)) return

      const feedback = compareDrivers(driver, targetDriver)
      const newGuess: Guess = { driver, feedback }
      setGuesses((prev) => [...prev, newGuess])

      if (driver.id === targetDriver.id) {
        setStatus('won')
      }
    },
    [targetDriver, guesses, status]
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
