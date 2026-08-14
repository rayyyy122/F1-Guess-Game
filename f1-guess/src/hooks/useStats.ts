import { useState, useCallback, useEffect } from 'react'
import type { GameStats } from '../types'
import type { SoloMode } from '../utils/drivers'
import { loadStats, recordGameResult } from '../utils/storage'

export function useStats(mode: SoloMode = 'classic') {
  const [stats, setStats] = useState<GameStats>(() => loadStats(mode))

  useEffect(() => {
    setStats(loadStats(mode))
  }, [mode])

  const recordWin = useCallback(
    (guessCount: number) => {
      const newStats = recordGameResult(true, guessCount, mode)
      setStats(newStats)
    },
    [mode]
  )

  const recordGiveUp = useCallback(() => {
    const newStats = recordGameResult(false, 0, mode)
    setStats(newStats)
  }, [mode])

  const recordLoss = useCallback(() => {
    const newStats = recordGameResult(false, 0, mode)
    setStats(newStats)
  }, [mode])

  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0
  const averageGuesses = stats.wins > 0 ? (stats.totalGuesses / stats.wins).toFixed(1) : '-'

  return {
    stats,
    recordWin,
    recordGiveUp,
    recordLoss,
    winRate,
    averageGuesses,
  }
}
