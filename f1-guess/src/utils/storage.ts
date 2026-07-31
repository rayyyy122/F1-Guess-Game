import type { GameStats } from '../types'

const STATS_KEY = 'f1-guess-stats'
const HELP_SEEN_KEY = 'f1-guess-help-seen'
const PLAYER_NAME_KEY = 'f1-guess-player-name'

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

// F1 车队列表用于生成默认昵称
const F1_TEAMS = [
  'Ferrari', 'McLaren', 'Mercedes', 'RedBull', 'AstonMartin',
  'Alpine', 'Williams', 'RB', 'Haas', 'Sauber', 'Audi', 'Cadillac',
]

// F1 相关的形容词
const ADJECTIVES = [
  'Speedy', 'Rapid', 'Swift', 'Turbo', 'Nitro', 'Apex', 'Pole', 'Chicane',
  'Drift', 'Overtake', 'Podium', 'Champion', 'Racer', 'Pilot', 'Driver',
  'Track', 'Pit', 'Lap', 'Sector', 'Pace', 'Grip', 'Aero', 'Engine',
  'Brake', 'Accelerate', 'Corner', 'Straight', 'Checkered', 'Flag',
]

/**
 * 生成随机 F1 风格默认昵称
 * 格式: 形容词 + 车队 + 随机数字 (例如: SpeedyFerrari42)
 */
function generateDefaultName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const team = F1_TEAMS[Math.floor(Math.random() * F1_TEAMS.length)]
  const num = Math.floor(Math.random() * 99) + 1
  return `${adj}${team}${num}`
}

/**
 * 加载玩家昵称，如果不存在则生成并保存默认昵称
 */
export function loadPlayerName(): string {
  try {
    const savedName = localStorage.getItem(PLAYER_NAME_KEY)
    if (savedName) return savedName

    // 生成并保存默认昵称
    const defaultName = generateDefaultName()
    savePlayerName(defaultName)
    return defaultName
  } catch {
    return generateDefaultName()
  }
}

/**
 * 保存玩家昵称
 */
export function savePlayerName(name: string): void {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, name)
  } catch {
    // localStorage 不可用时静默失败
  }
}
