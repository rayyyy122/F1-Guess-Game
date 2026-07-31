import { useMemo, useState } from 'react'
import type { Driver, Guess } from '../../types'
import { SearchBox } from '../SearchBox/SearchBox'
import { GuessTable } from '../GuessTable/GuessTable'
import { Countdown } from './Countdown'
import { ConfirmModal } from '../ConfirmModal/ConfirmModal'

interface OnlineGameViewProps {
  myGuesses: Guess[]
  opponentGuessCount: number
  opponentLatestFeedback: Record<string, any> | null
  remainingTime: number
  playerName: string
  opponentName: string | null
  onGuess: (driver: Driver) => void
  onGiveUp: () => void
}

function FeedbackRow({ feedback }: { feedback: Record<string, any> }) {
  const keys = ['nationality', 'team', 'number', 'championships', 'podiums', 'wins', 'debutYear', 'status']
  return (
    <div className="flex gap-1 justify-center">
      {keys.map((key) => {
        const value = feedback[key]
        const type = typeof value === 'object' && value !== null ? value.type : value
        const emoji = type === 'correct' ? '🟩' : type === 'close' ? '🟨' : '⬜'
        return <span key={key} className="text-xl">{emoji}</span>
      })}
    </div>
  )
}

export function OnlineGameView({
  myGuesses,
  opponentGuessCount,
  opponentLatestFeedback,
  remainingTime,
  playerName,
  opponentName,
  onGuess,
  onGiveUp,
}: OnlineGameViewProps) {
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false)
  const guessedIds = useMemo(() => new Set(myGuesses.map((g) => g.driver.id)), [myGuesses])
  const maxGuesses = 8
  const canGuess = myGuesses.length < maxGuesses && remainingTime > 0

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <Countdown remaining={remainingTime} />
      </div>

      <div className="flex justify-between items-center mb-6 px-4">
        <div className="text-center">
          <div className="text-sm text-gray-400">你 ({playerName})</div>
          <div className="text-2xl font-bold text-f1-red">{myGuesses.length} / {maxGuesses}</div>
        </div>
        <div className="text-3xl font-bold text-gray-600">VS</div>
        <div className="text-center">
          <div className="text-sm text-gray-400">{opponentName || '对手'}</div>
          <div className="text-2xl font-bold">{opponentGuessCount} / {maxGuesses}</div>
        </div>
      </div>

      <div className="mb-6">
        <SearchBox onSelect={onGuess} disabled={!canGuess} guessedIds={guessedIds} />
      </div>

      {opponentLatestFeedback && (
        <div className="mb-6 p-4 bg-f1-gray rounded-lg">
          <p className="text-sm text-gray-400 mb-2 text-center">对手最新猜测</p>
          <FeedbackRow feedback={opponentLatestFeedback} />
        </div>
      )}

      <GuessTable guesses={myGuesses} />

      {canGuess && myGuesses.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowGiveUpConfirm(true)}
            className="px-6 py-2 text-gray-400 hover:text-f1-red border border-gray-600 hover:border-f1-red rounded-lg font-medium transition-colors"
          >
            放弃
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={showGiveUpConfirm}
        title="确认放弃？"
        message="放弃后将直接输掉本局比赛。确定要放弃吗？"
        confirmText="确认放弃"
        cancelText="继续猜"
        danger
        onConfirm={() => {
          setShowGiveUpConfirm(false)
          onGiveUp()
        }}
        onCancel={() => setShowGiveUpConfirm(false)}
      />
    </div>
  )
}
