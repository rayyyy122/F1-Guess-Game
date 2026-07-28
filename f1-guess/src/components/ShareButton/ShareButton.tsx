import { useState } from 'react'
import type { Guess } from '../../types'

interface ShareButtonProps {
  guesses: Guess[]
  guessCount: number
}

function generateShareText(guesses: Guess[], guessCount: number): string {
  const lines: string[] = [`F1 Guess - ${guessCount} 次猜中！`, '']

  guesses.forEach((guess) => {
    const row = [
      guess.feedback.nationality,
      guess.feedback.team,
      guess.feedback.number.type,
      guess.feedback.championships.type,
      guess.feedback.podiums.type,
      guess.feedback.wins.type,
      guess.feedback.debutYear.type,
      guess.feedback.status,
    ]
      .map((f) => (f === 'correct' ? '🟩' : f === 'close' ? '🟨' : '⬜'))
      .join('')
    lines.push(row)
  })

  lines.push('', window.location.href)
  return lines.join('\n')
}

export function ShareButton({ guesses, guessCount }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const text = generateShareText(guesses, guessCount)

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareTwitter = () => {
    const text = generateShareText(guesses, guessCount)
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={handleShare}
        className="px-6 py-2 bg-f1-green text-f1-dark rounded-lg font-medium hover:bg-green-400 transition-colors"
      >
        {copied ? '已复制!' : '复制结果'}
      </button>
      <button
        onClick={handleShareTwitter}
        className="px-6 py-2 bg-f1-gray hover:bg-gray-600 rounded-lg font-medium transition-colors"
      >
        分享到 X
      </button>
    </div>
  )
}
