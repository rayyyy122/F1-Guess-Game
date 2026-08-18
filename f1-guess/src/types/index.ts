export type DriverStatus = 'active' | 'reserve' | 'retired'

export interface Driver {
  id: string
  name: string
  nameCn?: string
  nationality: string
  team: string
  teamCn?: string
  teams: string[]
  number: number
  championships: number
  podiums: number
  wins: number
  debutYear: number
  lastYear?: number  // 最后参赛年份（退役车手可选，用于简单版池子筛选）
  status: DriverStatus
  country: string
}

export type FeedbackType = 'correct' | 'close' | 'wrong'

export type NumericDirection = 'up' | 'down' | 'equal'

export interface NumericFeedback {
  type: FeedbackType
  direction: NumericDirection
}

export interface GuessFeedback {
  nationality: FeedbackType
  team: FeedbackType
  number: NumericFeedback
  championships: NumericFeedback
  podiums: NumericFeedback
  wins: NumericFeedback
  debutYear: NumericFeedback
  status: FeedbackType
}

export interface Guess {
  driver: Driver
  feedback: GuessFeedback
}

export type GameStatus = 'playing' | 'won' | 'givenUp' | 'lost'

export interface Announcement {
  date: string
  title: string
  content: string
}

export const MAX_GUESSES = 8

export interface GameStats {
  totalGames: number
  wins: number
  currentStreak: number
  maxStreak: number
  totalGuesses: number
  bestGame: number | null
}
