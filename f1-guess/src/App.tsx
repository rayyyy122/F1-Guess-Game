import { useMemo, useState, useCallback, useEffect } from 'react'
import { useGame } from './hooks/useGame'
import { useStats } from './hooks/useStats'
import { Header } from './components/Header/Header'
import { SearchBox } from './components/SearchBox/SearchBox'
import { GuessTable } from './components/GuessTable/GuessTable'
import { GameStatusBanner } from './components/GameStatus'
import { StatsModal } from './components/StatsModal/StatsModal'
import { HelpModal } from './components/HelpModal/HelpModal'
import { hasSeenHelp, markHelpSeen } from './utils/storage'

function App() {
  const { recordWin } = useStats()
  const [isStatsOpen, setIsStatsOpen] = useState(false)
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

  const handleWin = useCallback(
    (guessCount: number) => {
      recordWin(guessCount)
    },
    [recordWin]
  )

  const { targetDriver, guesses, status, makeGuess, resetGame, guessCount } = useGame({
    onWin: handleWin,
  })

  const guessedIds = useMemo(() => new Set(guesses.map((g) => g.driver.id)), [guesses])

  return (
    <div className="min-h-screen bg-f1-dark text-f1-text">
      <Header
        onNewGame={resetGame}
        onShowStats={() => setIsStatsOpen(true)}
        onShowHelp={() => setIsHelpOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">猜出 F1 车手</h1>
          <p className="text-gray-400">通过国籍、车队、车号等属性找出隐藏的车手</p>
        </div>

        <GameStatusBanner
          status={status}
          targetDriver={targetDriver}
          guesses={guesses}
          guessCount={guessCount}
          onNewGame={resetGame}
        />

        <div className="mb-8">
          <SearchBox onSelect={makeGuess} disabled={status === 'won'} guessedIds={guessedIds} />
        </div>

        {guesses.length > 0 && (
          <div className="mb-4 text-center text-sm text-gray-400">已猜测 {guessCount} 次</div>
        )}

        <GuessTable guesses={guesses} />
      </main>

      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={handleCloseHelp} />
    </div>
  )
}

export default App
