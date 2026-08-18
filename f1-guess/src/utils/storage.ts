import type { GameStats } from '../types'
import type { SoloMode } from './drivers'

// 经典版沿用旧 key，兼容已有统计数据
const STATS_KEYS: Record<SoloMode, string> = {
  classic: 'f1-guess-stats',
  easy: 'f1-guess-stats-easy',
}
const HELP_SEEN_KEY = 'f1-guess-help-seen'
const PLAYER_NAME_KEY = 'f1-guess-player-name'
const ONLINE_SESSION_KEY = 'f1-guess-online-session'

export interface OnlineSession {
  roomId: string
  playerId: string
  playerName: string
}

// 联机会话存 sessionStorage：刷新页面保留（可自动重连），关闭标签页清除
export function saveOnlineSession(session: OnlineSession): void {
  try {
    sessionStorage.setItem(ONLINE_SESSION_KEY, JSON.stringify(session))
  } catch {
    // 静默失败
  }
}

export function loadOnlineSession(): OnlineSession | null {
  try {
    const data = sessionStorage.getItem(ONLINE_SESSION_KEY)
    if (!data) return null
    const parsed = JSON.parse(data)
    if (parsed?.roomId && parsed?.playerId) return parsed
    return null
  } catch {
    return null
  }
}

export function clearOnlineSession(): void {
  try {
    sessionStorage.removeItem(ONLINE_SESSION_KEY)
  } catch {
    // 静默失败
  }
}

const defaultStats: GameStats = {
  totalGames: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  totalGuesses: 0,
  bestGame: null,
}

export function loadStats(mode: SoloMode = 'classic'): GameStats {
  try {
    const data = localStorage.getItem(STATS_KEYS[mode])
    if (!data) return defaultStats
    return { ...defaultStats, ...JSON.parse(data) }
  } catch {
    return defaultStats
  }
}

export function saveStats(stats: GameStats, mode: SoloMode = 'classic'): void {
  try {
    localStorage.setItem(STATS_KEYS[mode], JSON.stringify(stats))
  } catch {
    // localStorage 不可用时静默失败
  }
}

export function recordGameResult(
  won: boolean,
  guessCount: number,
  mode: SoloMode = 'classic'
): GameStats {
  const stats = loadStats(mode)
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
  saveStats(newStats, mode)
  return newStats
}

export function hasSeenHelp(key = HELP_SEEN_KEY): boolean {
  try {
    return localStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

export function markHelpSeen(key = HELP_SEEN_KEY): void {
  try {
    localStorage.setItem(key, 'true')
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
