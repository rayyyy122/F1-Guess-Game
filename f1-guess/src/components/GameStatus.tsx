import type { GameStatus, Driver, Guess } from '../types'
import { ShareButton } from './ShareButton/ShareButton'

interface GameStatusProps {
  status: GameStatus
  targetDriver: Driver
  guesses: Guess[]
  guessCount: number
  onNewGame: () => void
}

export function GameStatusBanner({
  status,
  targetDriver,
  guesses,
  guessCount,
  onNewGame,
}: GameStatusProps) {
  if (status === 'playing') return null

  return (
    <div className="w-full max-w-xl mx-auto mb-6 p-6 bg-f1-green text-f1-dark rounded-lg text-center">
      <h2 className="text-2xl font-bold mb-2">🎉 恭喜你猜对了！</h2>
      <p className="mb-1">
        答案是 <strong>{targetDriver.name}</strong>
        {targetDriver.nameCn && ` (${targetDriver.nameCn})`}
      </p>
      <p className="text-sm mb-4">用了 {guessCount} 次猜测</p>
      <div className="flex flex-col gap-3">
        <ShareButton guesses={guesses} guessCount={guessCount} />
        <button
          onClick={onNewGame}
          className="px-6 py-2 bg-f1-dark text-f1-text rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          再来一局
        </button>
      </div>
    </div>
  )
}
