import { useMemo, useState } from 'react'
import type { Driver, Guess, GuessFeedback } from '../../types'
import { SearchBox } from '../SearchBox/SearchBox'
import { RulesHint } from '../RulesHint'
import { GuessTable } from '../GuessTable/GuessTable'
import { Countdown } from './Countdown'
import { ConfirmModal } from '../ConfirmModal/ConfirmModal'

interface OnlineGameViewProps {
  myGuesses: Guess[]
  opponentGuessCount: number
  opponentGuesses: GuessFeedback[]
  remainingTime: number
  playerName: string
  opponentName: string | null
  onGuess: (driver: Driver) => void
  onGiveUp: () => void
}

export function OnlineGameView({
  myGuesses,
  opponentGuessCount,
  opponentGuesses,
  remainingTime,
  playerName,
  opponentName,
  onGuess,
  onGiveUp,
}: OnlineGameViewProps) {
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false)
  const guessedIds = useMemo(() => new Set(myGuesses.map((g) => g.driver.id)), [myGuesses])
  const maskedOpponentGuesses = useMemo(
    () => opponentGuesses.map((feedback) => ({ feedback })),
    [opponentGuesses]
  )
  const maxGuesses = 8
  const canGuess = myGuesses.length < maxGuesses && remainingTime > 0

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-6">
        <Countdown remaining={remainingTime} />
      </div>

      <div className="flex justify-center items-center gap-8 sm:gap-16 mb-6">
        <div className="text-center w-28">
          <div className="text-sm text-gray-400 truncate">你 ({playerName})</div>
          <div className="text-2xl font-black italic tabular-nums text-f1-red">{myGuesses.length} / {maxGuesses}</div>
        </div>
        <div className="text-3xl font-black italic text-gray-600">VS</div>
        <div className="text-center w-28">
          <div className="text-sm text-gray-400 truncate">{opponentName || '对手'}</div>
          <div className="text-2xl font-black italic tabular-nums">{opponentGuessCount} / {maxGuesses}</div>
        </div>
      </div>

      <div className="mb-6">
        <SearchBox onSelect={onGuess} disabled={!canGuess} guessedIds={guessedIds} />
      </div>

      {myGuesses.length > 0 && (
        <p className="text-sm text-gray-400 mb-2 text-center">你的猜测</p>
      )}
      <GuessTable guesses={myGuesses} />

      {opponentGuesses.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-gray-400 mb-2 text-center">
            {opponentName || '对手'}的猜测
          </p>
          <GuessTable guesses={maskedOpponentGuesses} masked />
        </div>
      )}

      <RulesHint />

      {canGuess && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowGiveUpConfirm(true)}
            className="px-6 py-2 text-gray-400 hover:text-f1-red border border-white/20 hover:border-f1-red rounded-lg font-medium transition-colors"
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
