export interface Driver {
  id: string
  name: string
  nameCn?: string
  nationality: string
  team: string
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

export interface GuessFeedback {
  nationality: FeedbackType
  team: FeedbackType
  number: FeedbackType
  championships: FeedbackType
  podiums: FeedbackType
  wins: FeedbackType
  debutYear: FeedbackType
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
