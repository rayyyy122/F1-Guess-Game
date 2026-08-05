import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { drivers } from '../utils/drivers'
import { Logo } from '../components/Logo'
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
    <div className="min-h-screen text-f1-text flex flex-col">
      <header className="w-full border-b border-white/10 py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <Logo />
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pt-20 sm:pt-28">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-4xl font-black italic tracking-tight mb-3">F1 车手猜谜游戏</h1>
          <p className="text-gray-400 mb-12">选择游戏模式开始挑战</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/solo"
              className="block p-8 bg-f1-card hover:bg-f1-elevated rounded-xl transition-all border-2 border-transparent hover:border-f1-red hover:-translate-y-1 hover:shadow-2xl hover:shadow-f1-red/10"
            >
              <div className="text-4xl mb-4">🎮</div>
              <h2 className="text-xl font-bold mb-2">单机模式</h2>
              <p className="text-sm text-gray-400">独自挑战，8 次机会猜出车手</p>
            </Link>

            <Link
              to="/online"
              className="block p-8 bg-f1-card hover:bg-f1-elevated rounded-xl transition-all border-2 border-transparent hover:border-f1-red hover:-translate-y-1 hover:shadow-2xl hover:shadow-f1-red/10"
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
