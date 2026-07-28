import type { GameStats } from '../types'

const STATS_KEY = 'f1-guess-stats'
const HELP_SEEN_KEY = 'f1-guess-help-seen'

const defaultStats: GameStats = {
  totalGames: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  totalGuesses: 0,
  bestGame: null,
}

export function loadStats(): GameStats {
  try {
    const data = localStorage.getItem(STATS_KEY)
    if (!data) return defaultStats
    return { ...defaultStats, ...JSON.parse(data) }
  } catch {
    return defaultStats
  }
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {
    // localStorage 不可用时静默失败
  }
}

export function recordGameResult(won: boolean, guessCount: number): GameStats {
  const stats = loadStats()
  const newStats: GameStats = {
    totalGames: stats.totalGames + 1,
    wins: won ? stats.wins + 1 : stats.wins,
    currentStreak: won ? stats.currentStreak + 1 : 0,
    maxStreak: won ? Math.max(stats.maxStreak, stats.currentStreak + 1) : stats.maxStreak,
    totalGuesses: won ? stats.totalGuesses + guessCount : stats.totalGuesses,
    bestGame: won
      ? stats.bestGame === null
        ? guessCount
        : Math.min(stats.bestGame, guessCount)
      : stats.bestGame,
  }
  saveStats(newStats)
  return newStats
}

export function hasSeenHelp(): boolean {
  try {
    return localStorage.getItem(HELP_SEEN_KEY) === 'true'
  } catch {
    return false
  }
}

export function markHelpSeen(): void {
  try {
    localStorage.setItem(HELP_SEEN_KEY, 'true')
  } catch {
    // localStorage 不可用时静默失败
  }
}
