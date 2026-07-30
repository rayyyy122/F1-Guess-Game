import type { Driver } from '../../types'

interface ResultModalProps {
  isOpen: boolean
  result: 'win' | 'lose' | 'tie' | null
  yourGuesses: number
  opponentGuesses: number
  targetDriver: Driver | null
  opponentName: string | null
  onRestart: () => void
  onBackToLobby: () => void
}

export function ResultModal({
  isOpen,
  result,
  yourGuesses,
  opponentGuesses,
  targetDriver,
  opponentName,
  onRestart,
  onBackToLobby,
}: ResultModalProps) {
  if (!isOpen || !result) return null

  const title =
    result === 'win' ? '🎉 你赢了！' : result === 'lose' ? '😔 你输了' : '🤝 平局'
  const titleColor =
    result === 'win' ? 'text-f1-green' : result === 'lose' ? 'text-f1-red' : 'text-f1-yellow'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-f1-gray rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className={`text-3xl font-bold mb-6 text-center ${titleColor}`}>{title}</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-f1-dark rounded-lg">
            <div className="text-sm text-gray-400 mb-1">你</div>
            <div className="text-3xl font-bold text-f1-red">{yourGuesses}</div>
            <div className="text-xs text-gray-400">次猜测</div>
          </div>
          <div className="text-center p-4 bg-f1-dark rounded-lg">
            <div className="text-sm text-gray-400 mb-1">{opponentName || '对手'}</div>
            <div className="text-3xl font-bold">{opponentGuesses}</div>
            <div className="text-xs text-gray-400">次猜测</div>
          </div>
        </div>

        {targetDriver && (
          <div className="mb-6 p-4 bg-f1-dark rounded-lg">
            <div className="text-sm text-gray-400 mb-2 text-center">目标车手</div>
            <div className="text-center">
              <div className="text-xl font-bold text-f1-red mb-1">
                {targetDriver.nameCn
                  ? `${targetDriver.nameCn} (${targetDriver.name})`
                  : targetDriver.name}
              </div>
              <div className="text-sm text-gray-400">
                {targetDriver.teamCn || targetDriver.team} · {targetDriver.number} 号 ·{' '}
                {targetDriver.championships} 冠
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onBackToLobby}
            className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors"
          >
            返回大厅
          </button>
          <button
            onClick={onRestart}
            className="flex-1 py-3 bg-f1-red hover:bg-red-700 rounded-lg font-medium transition-colors"
          >
            再来一局
          </button>
        </div>
      </div>
    </div>
  )
}
