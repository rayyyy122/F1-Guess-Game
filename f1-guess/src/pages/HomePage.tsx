import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { drivers } from '../utils/drivers'
import { HelpModal } from '../components/HelpModal/HelpModal'
import { hasSeenHelp, markHelpSeen } from '../utils/storage'

export function HomePage() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  useEffect(() => {
    if (!hasSeenHelp()) {
      setIsHelpOpen(true)
    }
  }, [])

  const handleCloseHelp = useCallback(() => {
    setIsHelpOpen(false)
    markHelpSeen()
  }, [])

  return (
    <div className="min-h-screen bg-f1-dark text-f1-text flex flex-col">
      <header className="w-full border-b border-gray-700 py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-f1-red">F1</span>
            <span className="text-xl font-bold">GUESS</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold mb-3">F1 车手猜谜游戏</h1>
          <p className="text-gray-400 mb-12">选择游戏模式开始挑战</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/solo"
              className="block p-8 bg-f1-gray hover:bg-gray-600 rounded-xl transition-colors border-2 border-transparent hover:border-f1-red"
            >
              <div className="text-4xl mb-4">🎮</div>
              <h2 className="text-xl font-bold mb-2">单机模式</h2>
              <p className="text-sm text-gray-400">独自挑战，8 次机会猜出车手</p>
            </Link>

            <Link
              to="/online"
              className="block p-8 bg-f1-gray hover:bg-gray-600 rounded-xl transition-colors border-2 border-transparent hover:border-f1-red"
            >
              <div className="text-4xl mb-4">⚔️</div>
              <h2 className="text-xl font-bold mb-2">联机模式</h2>
              <p className="text-sm text-gray-400">1v1 实时对战，2 分钟限时</p>
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-xs text-gray-500">
        数据截止到 2026-07-27，匈牙利大奖赛，共 {drivers.length} 名车手
      </footer>

      <HelpModal isOpen={isHelpOpen} onClose={handleCloseHelp} />
    </div>
  )
}
