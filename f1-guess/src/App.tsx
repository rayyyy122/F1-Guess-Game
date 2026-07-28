import { useMemo } from 'react'
import { useGame } from './hooks/useGame'
import { Header } from './components/Header/Header'
import { SearchBox } from './components/SearchBox/SearchBox'
import { GuessTable } from './components/GuessTable/GuessTable'
import { GameStatusBanner } from './components/GameStatus'

function App() {
  const { targetDriver, guesses, status, makeGuess, resetGame, guessCount } = useGame()

  const guessedIds = useMemo(() => new Set(guesses.map((g) => g.driver.id)), [guesses])

  return (
    <div className="min-h-screen bg-f1-dark text-f1-text">
      <Header onNewGame={resetGame} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">猜出 F1 车手</h1>
          <p className="text-gray-400">通过国籍、车队、车号等属性找出隐藏的车手</p>
        </div>

        <GameStatusBanner
          status={status}
          targetDriver={targetDriver}
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
    </div>
  )
}

export default App
