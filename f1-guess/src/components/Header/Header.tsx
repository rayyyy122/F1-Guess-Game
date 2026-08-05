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
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black italic tracking-tight text-f1-red">F1</span>
          <span className="text-xl font-black italic tracking-tight">GUESS</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onShowHelp}
            className="px-4 py-2 btn-secondary"
          >
            规则
          </button>
          <button
            onClick={onShowStats}
            className="px-4 py-2 btn-secondary"
          >
            统计
          </button>
          {showNewGame && onNewGame && (
            <button
              onClick={onNewGame}
              className="px-4 py-2 btn-primary"
            >
              新游戏
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
