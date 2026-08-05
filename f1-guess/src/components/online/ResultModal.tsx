import type { Driver } from '../../types'

interface ResultModalProps {
  isOpen: boolean
  result: 'win' | 'lose' | 'tie' | null
  yourGuesses: number
  opponentGuesses: number
  targetDriver: Driver | null
  opponentName: string | null
  opponentLeft?: boolean
  restartInvite: {
    from: string | null
    accepted: boolean
    declined: boolean
    iRequested: boolean
  }
  onRequestRestart: () => void
  onAcceptRestart: () => void
  onBackToLobby: () => void
}

export function ResultModal({
  isOpen,
  result,
  yourGuesses,
  opponentGuesses,
  targetDriver,
  opponentName,
  opponentLeft = false,
  restartInvite,
  onRequestRestart,
  onAcceptRestart,
  onBackToLobby,
}: ResultModalProps) {
  if (!isOpen || !result) return null

  const title =
    result === 'win' ? '🎉 你赢了！' : result === 'lose' ? '😔 你输了' : '🤝 平局'
  const titleColor =
    result === 'win' ? 'text-f1-green' : result === 'lose' ? 'text-f1-red' : 'text-f1-yellow'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-f1-card rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
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

        {/* 邀请状态显示 */}
        {opponentLeft && (
          <div className="mb-4 p-3 bg-f1-dark border border-white/15 rounded-lg">
            <p className="text-center text-sm text-gray-400">对手已离开房间</p>
          </div>
        )}

        {restartInvite.from && (
          <div className="mb-4 p-3 bg-f1-green/20 border border-f1-green rounded-lg">
            <p className="text-center text-sm">
              <span className="font-medium">{restartInvite.from}</span> 邀请您再来一局
            </p>
          </div>
        )}

        {restartInvite.accepted && (
          <div className="mb-4 p-3 bg-f1-green/20 border border-f1-green rounded-lg">
            <p className="text-center text-sm">对手接受了邀请，即将开始...</p>
          </div>
        )}

        {restartInvite.declined && (
          <div className="mb-4 p-3 bg-f1-red/20 border border-f1-red rounded-lg">
            <p className="text-center text-sm">对方拒绝了再来一局</p>
          </div>
        )}

        {restartInvite.iRequested && !restartInvite.accepted && !restartInvite.declined && (
          <div className="mb-4 p-3 bg-f1-blue/20 border border-f1-blue rounded-lg">
            <p className="text-center text-sm">等待对方响应...</p>
          </div>
        )}

        <div className="flex gap-3">
          {opponentLeft ? (
            // 对手已离开，房间不存在了，只能返回大厅
            <button
              onClick={onBackToLobby}
              className="w-full py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors"
            >
              返回大厅
            </button>
          ) : restartInvite.from ? (
            // 收到邀请时，显示接受/拒绝并退出按钮
            <>
              <button
                onClick={onBackToLobby}
                className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors"
              >
                拒绝并退出
              </button>
              <button
                onClick={onAcceptRestart}
                className="flex-1 py-3 bg-f1-green text-f1-dark hover:bg-green-400 rounded-lg font-medium transition-colors"
              >
                接受
              </button>
            </>
          ) : restartInvite.iRequested && !restartInvite.accepted && !restartInvite.declined ? (
            // 已发送邀请，等待响应时，只有返回大厅按钮
            <button
              onClick={onBackToLobby}
              className="w-full py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors"
            >
              返回大厅
            </button>
          ) : (
            // 正常状态，显示返回大厅和再来一局按钮
            <>
              <button
                onClick={onBackToLobby}
                className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors"
              >
                返回大厅
              </button>
              <button
                onClick={onRequestRestart}
                className="flex-1 py-3 bg-f1-red hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                再来一局
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
