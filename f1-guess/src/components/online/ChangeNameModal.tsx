import { useState, useEffect } from 'react'

interface ChangeNameModalProps {
  isOpen: boolean
  currentName: string
  onClose: () => void
  onSave: (name: string) => void
}

export function ChangeNameModal({ isOpen, currentName, onClose, onSave }: ChangeNameModalProps) {
  const [name, setName] = useState(currentName)

  useEffect(() => {
    if (isOpen) {
      setName(currentName)
    }
  }, [isOpen, currentName])

  const handleSave = () => {
    const trimmedName = name.trim()
    if (trimmedName && trimmedName !== currentName) {
      onSave(trimmedName)
    }
    onClose()
  }

  const handleRandom = () => {
    const adj = ['Speedy', 'Rapid', 'Swift', 'Turbo', 'Nitro', 'Apex', 'Pole', 'Chicane']
    const team = ['Ferrari', 'McLaren', 'Mercedes', 'RedBull', 'AstonMartin', 'Alpine']
    const num = Math.floor(Math.random() * 99) + 1
    setName(`${adj[Math.floor(Math.random() * adj.length)]}${team[Math.floor(Math.random() * team.length)]}${num}`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-f1-card rounded-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-center">修改昵称</h2>

        <div className="mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入新昵称"
            maxLength={20}
            className="w-full px-4 py-3 rounded-lg bg-f1-dark text-f1-text placeholder-gray-400 border-2 border-transparent focus:border-f1-red focus:outline-none"
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{name.length}/20</p>
        </div>

        <button
          onClick={handleRandom}
          className="w-full mb-4 py-2 bg-f1-dark hover:bg-f1-elevated border border-white/15 rounded-lg text-sm transition-colors"
        >
          🎲 随机生成
        </button>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 btn-secondary"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || name.trim() === currentName}
            className="flex-1 py-3 btn-primary"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
