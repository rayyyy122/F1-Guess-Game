import type { GameStatus, Driver } from '../types'

interface GameStatusProps {
  status: GameStatus
  targetDriver: Driver
  guessCount: number
  onNewGame: () => void
  onShowAnswer: () => void
}

export function GameStatusBanner({
  status,
  targetDriver,
  guessCount,
  onNewGame,
  onShowAnswer,
}: GameStatusProps) {
  if (status === 'playing' || status === 'givenUp') return null

  if (status === 'lost') {
    return (
      <div className="w-full max-w-xl mx-auto mb-6 p-6 bg-f1-gray border-2 border-f1-red rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-2">😔 游戏结束</h2>
        <p className="mb-4">8 次机会已用完</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onShowAnswer}
            className="px-6 py-2 bg-f1-yellow text-f1-dark rounded-lg font-medium hover:bg-yellow-400 transition-colors"
          >
            查看答案
          </button>
          <button
            onClick={onNewGame}
            className="px-6 py-2 bg-f1-red hover:bg-red-700 rounded-lg font-medium transition-colors"
          >
            再来一局
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl mx-auto mb-6 p-6 bg-f1-green text-f1-dark rounded-lg text-center">
      <h2 className="text-2xl font-bold mb-2">🎉 恭喜你猜对了！</h2>
      <p className="mb-1">
        答案是 <strong>{targetDriver.name}</strong>
        {targetDriver.nameCn && ` (${targetDriver.nameCn})`}
      </p>
      <p className="text-sm mb-4">用了 {guessCount} 次猜测</p>
      <button
        onClick={onNewGame}
        className="px-6 py-2 bg-f1-dark text-f1-text rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        再来一局
      </button>
    </div>
  )
}
