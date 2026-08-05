import { useEffect, useState } from 'react'
import type { GameStats } from '../../types'
import { loadStats } from '../../utils/storage'

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-f1-red">{value}</div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  )
}

export function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const [stats, setStats] = useState<GameStats>(loadStats)

  useEffect(() => {
    if (isOpen) {
      setStats(loadStats())
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0
  const averageGuesses = stats.wins > 0 ? (stats.totalGuesses / stats.wins).toFixed(1) : '-'

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-f1-card rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">游戏统计</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <StatItem label="总场次" value={stats.totalGames} />
          <StatItem label="胜率" value={`${winRate}%`} />
          <StatItem label="当前连胜" value={stats.currentStreak} />
          <StatItem label="最大连胜" value={stats.maxStreak} />
          <StatItem label="平均猜测" value={averageGuesses} />
          <StatItem label="最佳成绩" value={stats.bestGame ?? '-'} />
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-f1-red hover:bg-red-700 rounded-lg font-medium transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  )
}
