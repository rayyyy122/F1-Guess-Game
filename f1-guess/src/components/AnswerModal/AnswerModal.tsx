import { useEffect } from 'react'
import type { Driver } from '../../types'

interface AnswerModalProps {
  isOpen: boolean
  driver: Driver
  guessCount: number
  onNewGame: () => void
}

const statusText: Record<string, string> = {
  active: '现役',
  reserve: '储备车手',
  retired: '退役',
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/10 last:border-b-0">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export function AnswerModal({ isOpen, driver, guessCount, onNewGame }: AnswerModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onNewGame()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onNewGame])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onNewGame}
    >
      <div
        className="bg-f1-card rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏁</div>
          <h2 className="text-2xl font-bold mb-1">正确答案</h2>
          <p className="text-gray-400 text-sm">你猜了 {guessCount} 次</p>
        </div>

        <div className="bg-f1-dark rounded-lg p-4 mb-6">
          <div className="text-center mb-4 pb-4 border-b border-white/10">
            <div className="text-2xl font-bold text-f1-red">
              {driver.nameCn ? `${driver.nameCn} (${driver.name})` : driver.name}
            </div>
          </div>
          <div className="space-y-1">
            <InfoRow label="国籍" value={driver.nationality} />
            <InfoRow
              label="车队"
              value={driver.teamCn ? `${driver.teamCn} (${driver.team})` : driver.team}
            />
            <InfoRow label="车号" value={driver.number} />
            <InfoRow label="世界冠军" value={`${driver.championships} 次`} />
            <InfoRow label="领奖台" value={`${driver.podiums} 次`} />
            <InfoRow label="分站冠军" value={`${driver.wins} 次`} />
            <InfoRow label="首秀年份" value={driver.debutYear} />
            <InfoRow label="状态" value={statusText[driver.status] ?? driver.status} />
          </div>
        </div>

        <button
          onClick={onNewGame}
          className="w-full py-3 bg-f1-red hover:bg-red-700 rounded-lg font-medium transition-colors"
        >
          开始新游戏
        </button>
      </div>
    </div>
  )
}
