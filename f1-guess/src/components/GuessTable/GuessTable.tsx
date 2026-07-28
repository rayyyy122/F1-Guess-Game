import type { Guess, FeedbackType, NumericFeedback } from '../../types'

interface GuessTableProps {
  guesses: Guess[]
}

const columns = [
  { key: 'name', label: '姓名' },
  { key: 'nationality', label: '国籍' },
  { key: 'team', label: '车队' },
  { key: 'number', label: '车号' },
  { key: 'championships', label: '世界冠军' },
  { key: 'podiums', label: '领奖台' },
  { key: 'wins', label: '分站冠军' },
  { key: 'debutYear', label: '首秀' },
  { key: 'active', label: '现役' },
] as const

function getCellColor(feedback: FeedbackType): string {
  switch (feedback) {
    case 'correct':
      return 'bg-f1-green text-f1-dark'
    case 'close':
      return 'bg-f1-yellow text-f1-dark'
    case 'wrong':
      return 'bg-f1-gray text-f1-text'
  }
}

function Cell({ value, feedback }: { value: string | number; feedback?: FeedbackType }) {
  const colorClass = feedback ? getCellColor(feedback) : 'bg-f1-gray'
  return (
    <td className="p-1">
      <div
        className={`${colorClass} rounded px-2 py-2 text-xs font-medium text-center min-h-[2.5rem] flex items-center justify-center break-words leading-tight`}
      >
        {value}
      </div>
    </td>
  )
}

function NumericCell({ value, feedback }: { value: number; feedback: NumericFeedback }) {
  const colorClass = getCellColor(feedback.type)
  const arrow =
    feedback.direction === 'up' ? ' ↑' : feedback.direction === 'down' ? ' ↓' : ''
  return (
    <td className="p-1">
      <div
        className={`${colorClass} rounded px-2 py-2 text-xs font-medium text-center min-h-[2.5rem] flex items-center justify-center break-words leading-tight`}
      >
        {value}
        {arrow}
      </div>
    </td>
  )
}

export function GuessTable({ guesses }: GuessTableProps) {
  if (guesses.length === 0) return null

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-separate border-spacing-1">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="text-xs text-gray-400 font-normal pb-2 px-1">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {guesses.map((guess) => (
            <tr key={guess.driver.id}>
              <Cell
                value={
                  guess.driver.nameCn
                    ? `${guess.driver.nameCn} (${guess.driver.name})`
                    : guess.driver.name
                }
              />
              <Cell value={guess.driver.nationality} feedback={guess.feedback.nationality} />
              <Cell
                value={
                  guess.driver.teamCn
                    ? `${guess.driver.teamCn} (${guess.driver.team})`
                    : guess.driver.team
                }
                feedback={guess.feedback.team}
              />
              <NumericCell value={guess.driver.number} feedback={guess.feedback.number} />
              <NumericCell
                value={guess.driver.championships}
                feedback={guess.feedback.championships}
              />
              <NumericCell value={guess.driver.podiums} feedback={guess.feedback.podiums} />
              <NumericCell value={guess.driver.wins} feedback={guess.feedback.wins} />
              <NumericCell value={guess.driver.debutYear} feedback={guess.feedback.debutYear} />
              <Cell
                value={guess.driver.active ? '现役' : '退役'}
                feedback={guess.feedback.active}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
