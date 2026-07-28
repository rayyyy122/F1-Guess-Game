import { useState, useCallback, useEffect } from 'react'
import type { GameStats } from '../types'
import { loadStats, recordGameResult } from '../utils/storage'

export function useStats() {
  const [stats, setStats] = useState<GameStats>(loadStats)

  useEffect(() => {
    setStats(loadStats())
  }, [])

  const recordWin = useCallback((guessCount: number) => {
    const newStats = recordGameResult(true, guessCount)
    setStats(newStats)
  }, [])

  const recordGiveUp = useCallback(() => {
    const newStats = recordGameResult(false, 0)
    setStats(newStats)
  }, [])

  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0
  const averageGuesses = stats.wins > 0 ? (stats.totalGuesses / stats.wins).toFixed(1) : '-'

  return {
    stats,
    recordWin,
    recordGiveUp,
    winRate,
    averageGuesses,
  }
}
