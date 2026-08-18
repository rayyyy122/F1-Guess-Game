import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Gamepad2, Swords, Zap, Sparkles, BookOpen } from 'lucide-react'
import { drivers, easyDrivers } from '../utils/drivers'
import { Logo } from '../components/Logo'
import { Footer } from '../components/Footer'
import { HelpModal } from '../components/HelpModal/HelpModal'

// 模块级标记：只在本次页面加载后首次进入首页时弹规则。
// SPA 内从游戏页返回首页标记仍在（不弹），刷新页面模块重建（弹出）。
let hasEnteredHome = false

export function HomePage() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [helpTab, setHelpTab] = useState<'announcements' | 'rules'>('announcements')

  useEffect(() => {
    if (!hasEnteredHome) {
      hasEnteredHome = true
      setHelpTab('announcements')
      setIsHelpOpen(true)
    }
  }, [])

  const handleCloseHelp = useCallback(() => {
    setIsHelpOpen(false)
  }, [])

  const handleShowRules = useCallback(() => {
    setHelpTab('rules')
    setIsHelpOpen(true)
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
          <p className="text-gray-400 mb-8">选择游戏模式开始挑战</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/solo"
              className="block p-8 bg-f1-card hover:bg-f1-elevated rounded-xl transition-all border-2 border-transparent hover:border-f1-red hover:-translate-y-1 hover:shadow-2xl hover:shadow-f1-red/10"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-f1-red/10 flex items-center justify-center">
                <Gamepad2 size={32} className="text-f1-red" />
              </div>
              <h2 className="text-xl font-bold mb-2">单机模式</h2>
              <p className="text-sm text-gray-400">经典玩法，{drivers.length} 位车手</p>
            </Link>

            <Link
              to="/solo?mode=easy"
              className="block p-8 bg-f1-card hover:bg-f1-elevated rounded-xl transition-all border-2 border-transparent hover:border-f1-red hover:-translate-y-1 hover:shadow-2xl hover:shadow-f1-red/10"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-f1-red/10 flex items-center justify-center">
                <Zap size={32} className="text-f1-red" />
              </div>
              <h2 className="text-xl font-bold mb-2">简单模式</h2>
              <p className="text-sm text-gray-400">
                近年车手 + 世界冠军传奇，共 {easyDrivers.length} 位
              </p>
            </Link>

            <Link
              to="/online"
              className="block p-8 bg-f1-card hover:bg-f1-elevated rounded-xl transition-all border-2 border-transparent hover:border-f1-red hover:-translate-y-1 hover:shadow-2xl hover:shadow-f1-red/10"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-f1-red/10 flex items-center justify-center">
                <Swords size={32} className="text-f1-red" />
              </div>
              <h2 className="text-xl font-bold mb-2">联机模式</h2>
              <p className="text-sm text-gray-400">1v1 实时对战，2 分钟限时</p>
            </Link>

            <div className="block p-8 rounded-xl border-2 border-dashed border-white/15 text-gray-500 cursor-not-allowed">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Sparkles size={32} />
              </div>
              <h2 className="text-xl font-bold mb-2">敬请期待</h2>
              <p className="text-sm">更多玩法开发中</p>
            </div>
          </div>

          <button
            onClick={handleShowRules}
            className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 btn-secondary text-sm"
          >
            <BookOpen size={16} />
            查看游戏规则
          </button>
        </div>
      </main>

      <Footer />

      <HelpModal isOpen={isHelpOpen} onClose={handleCloseHelp} defaultTab={helpTab} />
    </div>
  )
}
