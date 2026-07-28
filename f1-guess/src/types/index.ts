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
  active: boolean
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
  active: FeedbackType
}

export interface Guess {
  driver: Driver
  feedback: GuessFeedback
}

export type GameStatus = 'playing' | 'won' | 'givenUp' | 'lost'

export const MAX_GUESSES = 8

export interface GameStats {
  totalGames: number
  wins: number
  currentStreak: number
  maxStreak: number
  totalGuesses: number
  bestGame: number | null
}
