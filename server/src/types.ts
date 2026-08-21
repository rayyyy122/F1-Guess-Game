export type PlayerStatus = 'playing' | 'won' | 'lost' | 'given_up'

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
  starts: number
  debutYear: number
  lastYear?: number
  status: 'active' | 'reserve' | 'retired'
  country: string
}

export interface Player {
  id: string
  name: string
  status: PlayerStatus
  guessCount: number
  guesses: PlayerGuess[]
  connected: boolean
  lastSeen: number
}

export interface PlayerGuess {
  driverId: string
  feedback: Record<string, string>
  timestamp: number
}

export type RoomStatus = 'waiting' | 'playing' | 'finished'

export type GameMode = 'classic' | 'easy'

export interface RoomState {
  id: string
  status: RoomStatus
  mode: GameMode
  players: Record<string, Player>
  targetDriverId: string | null
  startTime: number | null
  endTime: number | null
  duration: number
  winner: string | null
  endReason?: string | null
  createdAt: number
  restartRequests: string[]
}

export type ClientMessage =
  | { type: 'create_room'; playerName: string }
  | { type: 'join_room'; roomId: string; playerName: string }
  | { type: 'make_guess'; driverId: string }
  | { type: 'give_up' }
  | { type: 'request_restart' }
  | { type: 'accept_restart' }
  | { type: 'decline_restart' }
  | { type: 'leave_room' }
  | { type: 'ping' }

export type ServerMessage =
  | { type: 'room_created'; roomId: string; playerId: string }
  | { type: 'room_joined'; roomId: string; playerId: string; opponent: { name: string }; mode?: GameMode }
  | { type: 'opponent_joined'; opponent: { name: string } }
  | { type: 'game_start'; duration: number; mode?: GameMode }
  | { type: 'guess_result'; driverId: string; feedback: Record<string, string>; isCorrect: boolean }
  | { type: 'opponent_guess'; guessCount: number; feedback: Record<string, string> }
  | { type: 'opponent_finished'; status: PlayerStatus; guessCount: number }
  | { type: 'timer_sync'; remaining: number }
  | {
      type: 'state_sync'
      phase: RoomStatus
      mode?: GameMode
      yourGuesses: { driverId: string; feedback: Record<string, any> }[]
      // 只发颜色反馈，不发 driverId（防泄露对方猜测）
      opponentGuesses: Record<string, any>[]
    }
  | {
      type: 'game_end'
      result: 'win' | 'lose' | 'tie'
      reason: 'guessed' | 'timeout' | 'opponent_disconnect' | 'both_finished'
      yourGuesses: number
      opponentGuesses: number
      targetDriverId: string
      duration: number
    }
  | { type: 'opponent_request_restart'; playerName: string }
  | { type: 'restart_accepted'; acceptedBy: string }
  | { type: 'restart_declined' }
  | { type: 'game_restart' }
  | { type: 'opponent_left' }
  | { type: 'room_closed' }
  | { type: 'pong' }
  | { type: 'error'; code: string; message: string }
