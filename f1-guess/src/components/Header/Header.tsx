interface HeaderProps {
  onNewGame: () => void
}

export function Header({ onNewGame }: HeaderProps) {
  return (
    <header className="w-full border-b border-gray-700 py-4 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-f1-red">F1</span>
          <span className="text-xl font-bold">GUESS</span>
        </div>
        <button
          onClick={onNewGame}
          className="px-4 py-2 bg-f1-red hover:bg-red-700 rounded-lg font-medium transition-colors"
        >
          新游戏
        </button>
      </div>
    </header>
  )
}
