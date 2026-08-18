import { Logo } from '../Logo'
import { HelpCircle, BarChart3, RotateCcw } from 'lucide-react'

interface HeaderProps {
  onNewGame?: () => void
  onShowStats: () => void
  onShowHelp: () => void
  showNewGame?: boolean
}

export function Header({ onNewGame, onShowStats, onShowHelp, showNewGame = true }: HeaderProps) {
  return (
    <header className="w-full border-b border-white/10 py-4 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo />
        <div className="flex gap-2">
          <button
            onClick={onShowHelp}
            className="p-2 sm:px-4 sm:py-2 btn-secondary"
            title="规则"
          >
            <HelpCircle size={18} className="sm:hidden" />
            <span className="hidden sm:inline">规则</span>
          </button>
          <button
            onClick={onShowStats}
            className="p-2 sm:px-4 sm:py-2 btn-secondary"
            title="统计"
          >
            <BarChart3 size={18} className="sm:hidden" />
            <span className="hidden sm:inline">统计</span>
          </button>
          {showNewGame && onNewGame && (
            <button
              onClick={onNewGame}
              className="p-2 sm:px-4 sm:py-2 btn-primary"
              title="新游戏"
            >
              <RotateCcw size={18} className="sm:hidden" />
              <span className="hidden sm:inline">新游戏</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
