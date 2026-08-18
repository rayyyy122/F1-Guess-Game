import { useState } from 'react'
import { Check } from 'lucide-react'
import { drivers, easyDrivers } from '../../utils/drivers'

interface RoomWaitViewProps {
  roomId: string
  playerName: string
  opponentName: string | null
  mode: 'classic' | 'easy'
}

export function RoomWaitView({ roomId, playerName, opponentName, mode }: RoomWaitViewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = roomId
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold mb-2">等待对手加入</h2>
      <p className="text-sm text-f1-red font-medium mb-6">
        {mode === 'easy' ? `简单版 · ${easyDrivers.length} 位车手` : `经典版 · ${drivers.length} 位车手`}
      </p>

      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-3">房间号</p>
        <div className="flex items-center justify-center gap-3">
          <div className="px-6 py-3 bg-f1-card border border-white/10 rounded-lg text-3xl font-mono font-bold tracking-widest">
            {roomId}
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-3 btn-primary"
          >
            {copied ? '已复制!' : '复制'}
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <div className="p-4 bg-f1-card border border-white/10 rounded-lg flex items-center justify-between">
          <span className="font-medium">{playerName} (你)</span>
          <span className="text-f1-green flex items-center gap-1">
            <Check size={16} />
            已就绪
          </span>
        </div>

        {opponentName ? (
          <div className="p-4 bg-f1-card border border-white/10 rounded-lg flex items-center justify-between">
            <span className="font-medium">{opponentName}</span>
            <span className="text-f1-green flex items-center gap-1">
              <Check size={16} />
              已就绪
            </span>
          </div>
        ) : (
          <div className="p-4 border border-dashed border-white/15 rounded-lg flex items-center justify-center text-gray-400">
            <span className="animate-pulse">等待对手加入...</span>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-400">将房间号分享给朋友，对手加入后自动开始游戏</p>
    </div>
  )
}
