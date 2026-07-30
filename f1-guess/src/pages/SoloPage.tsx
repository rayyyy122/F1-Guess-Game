import { useMemo, useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import { useStats } from '../hooks/useStats'
import { Header } from '../components/Header/Header'
import { SearchBox } from '../components/SearchBox/SearchBox'
import { GuessTable } from '../components/GuessTable/GuessTable'
import { GameStatusBanner } from '../components/GameStatus'
import { StatsModal } from '../components/StatsModal/StatsModal'
import { HelpModal } from '../components/HelpModal/HelpModal'
import { ConfirmModal } from '../components/ConfirmModal/ConfirmModal'
import { AnswerModal } from '../components/AnswerModal/AnswerModal'
import { hasSeenHelp, markHelpSeen } from '../utils/storage'
import { drivers } from '../utils/drivers'

export function SoloPage() {
  const { recordWin, recordGiveUp, recordLoss } = useStats()
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isGiveUpConfirmOpen, setIsGiveUpConfirmOpen] = useState(false)
  const [isAnswerOpen, setIsAnswerOpen] = useState(false)

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

  const handleGiveUp = useCallback(() => {
    recordGiveUp()
    setIsGiveUpConfirmOpen(false)
    setIsAnswerOpen(true)
  }, [recordGiveUp])

  const handleLose = useCallback(() => {
    recordLoss()
  }, [recordLoss])

  const {
    targetDriver,
    guesses,
    status,
    makeGuess,
    giveUp,
    resetGame,
    guessCount,
    remainingGuesses,
    maxGuesses,
  } = useGame({
    onWin: handleWin,
    onGiveUp: handleGiveUp,
    onLose: handleLose,
  })

  const guessedIds = useMemo(() => new Set(guesses.map((g) => g.driver.id)), [guesses])

  const handleNewGameFromAnswer = useCallback(() => {
    setIsAnswerOpen(false)
    resetGame()
  }, [resetGame])

  const handleShowAnswer = useCallback(() => {
    setIsAnswerOpen(true)
  }, [])

  const isPlaying = status === 'playing'

  return (
    <div className="min-h-screen bg-f1-dark text-f1-text">
      <Header
        onNewGame={resetGame}
        onShowStats={() => setIsStatsOpen(true)}
        onShowHelp={() => setIsHelpOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/" className="text-sm text-gray-400 hover:text-f1-red">
            ← 返回首页
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">单机模式</h1>
          <p className="text-gray-400">
            {isPlaying
              ? `剩余 ${remainingGuesses} / ${maxGuesses} 次机会`
              : '通过国籍、车队、车号等属性找出隐藏的车手'}
          </p>
        </div>

        <GameStatusBanner
          status={status}
          targetDriver={targetDriver}
          guessCount={guessCount}
          onNewGame={resetGame}
          onShowAnswer={handleShowAnswer}
        />

        <div className="mb-8">
          <SearchBox onSelect={makeGuess} disabled={!isPlaying} guessedIds={guessedIds} />
        </div>

        {guesses.length > 0 && (
          <div className="mb-4 text-center text-sm text-gray-400">
            已猜测 {guessCount} / {maxGuesses} 次
          </div>
        )}

        <GuessTable guesses={guesses} targetDriverId={targetDriver.id} />

        {isPlaying && guesses.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsGiveUpConfirmOpen(true)}
              className="px-6 py-2 text-gray-400 hover:text-f1-red border border-gray-600 hover:border-f1-red rounded-lg font-medium transition-colors"
            >
              放弃看答案
            </button>
          </div>
        )}
      </main>

      <footer className="w-full py-4 text-center text-xs text-gray-500">
        数据截止到 2026-07-27，匈牙利大奖赛，共 {drivers.length} 名车手
      </footer>

      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={handleCloseHelp} />
      <ConfirmModal
        isOpen={isGiveUpConfirmOpen}
        title="确认放弃？"
        message="放弃后将直接显示正确答案，并且当前连胜记录会被清零。确定要放弃吗？"
        confirmText="确认放弃"
        cancelText="继续猜"
        danger
        onConfirm={giveUp}
        onCancel={() => setIsGiveUpConfirmOpen(false)}
      />
      <AnswerModal
        isOpen={isAnswerOpen}
        driver={targetDriver}
        guessCount={guessCount}
        onNewGame={handleNewGameFromAnswer}
      />
    </div>
  )
}
