import type { Guess, GuessFeedback, FeedbackType, NumericFeedback } from '../../types'

// 联机模式下对手的猜测只有反馈没有车手信息
export interface MaskedGuess {
  feedback: GuessFeedback
}

interface GuessTableProps {
  guesses: Array<Guess | MaskedGuess>
  targetDriverId?: string
  masked?: boolean
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
  { key: 'status', label: '状态' },
] as const

const statusText: Record<string, string> = {
  active: '现役',
  reserve: '储备',
  retired: '退役',
}

// 长文本列加宽，纯数字列收窄（未指定的列均分剩余宽度）
const columnWidths: Record<string, string> = {
  name: 'w-[30%]',
  team: 'w-[22%]',
  nationality: 'w-[8%]',
}

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

function Cell({
  value,
  feedback,
  delay,
}: {
  value: string | number
  feedback?: FeedbackType
  delay?: number
}) {
  const colorClass = feedback ? getCellColor(feedback) : 'bg-f1-gray'
  return (
    <td className="p-1">
      <div
        className={`${colorClass} rounded px-2 py-2 text-xs font-medium text-center min-h-[2.5rem] flex items-center justify-center break-words leading-tight ${
          delay != null ? 'cell-flip' : ''
        }`}
        style={delay != null ? { animationDelay: `${delay}ms` } : undefined}
      >
        {value}
      </div>
    </td>
  )
}

function NumericCell({
  value,
  feedback,
  delay,
}: {
  value: number
  feedback: NumericFeedback
  delay?: number
}) {
  const colorClass = getCellColor(feedback.type)
  const arrow =
    feedback.direction === 'up' ? ' ↑' : feedback.direction === 'down' ? ' ↓' : ''
  return (
    <td className="p-1">
      <div
        className={`${colorClass} rounded px-2 py-2 text-xs font-medium text-center min-h-[2.5rem] flex items-center justify-center break-words leading-tight ${
          delay != null ? 'cell-flip' : ''
        }`}
        style={delay != null ? { animationDelay: `${delay}ms` } : undefined}
      >
        {value}
        {arrow}
      </div>
    </td>
  )
}

export function GuessTable({ guesses, targetDriverId, masked = false }: GuessTableProps) {
  if (guesses.length === 0) return null

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full table-fixed border-separate border-spacing-1">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-xs text-gray-400 font-normal pb-2 px-1 ${
                  columnWidths[col.key] ?? ''
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {masked
            ? (guesses as MaskedGuess[]).map((guess, index) => {
                const d = (i: number) =>
                  index === guesses.length - 1 ? i * 80 : undefined
                return (
                  <tr key={index}>
                    <Cell value="***" delay={d(0)} />
                    <Cell value="***" feedback={guess.feedback.nationality} delay={d(1)} />
                    <Cell value="***" feedback={guess.feedback.team} delay={d(2)} />
                    <Cell value="***" feedback={guess.feedback.number.type} delay={d(3)} />
                    <Cell value="***" feedback={guess.feedback.championships.type} delay={d(4)} />
                    <Cell value="***" feedback={guess.feedback.podiums.type} delay={d(5)} />
                    <Cell value="***" feedback={guess.feedback.wins.type} delay={d(6)} />
                    <Cell value="***" feedback={guess.feedback.debutYear.type} delay={d(7)} />
                    <Cell value="***" feedback={guess.feedback.status} delay={d(8)} />
                  </tr>
                )
              })
            : (guesses as Guess[]).map((guess, index) => {
                const d = (i: number) =>
                  index === guesses.length - 1 ? i * 80 : undefined
                return (
            <tr key={guess.driver.id}>
              <Cell
                value={
                  guess.driver.nameCn
                    ? `${guess.driver.nameCn} (${guess.driver.name})`
                    : guess.driver.name
                }
                feedback={guess.driver.id === targetDriverId ? 'correct' : undefined}
                delay={d(0)}
              />
              <Cell value={guess.driver.nationality} feedback={guess.feedback.nationality} delay={d(1)} />
              <Cell
                value={
                  guess.driver.teamCn
                    ? `${guess.driver.teamCn} (${guess.driver.team})`
                    : guess.driver.team
                }
                feedback={guess.feedback.team}
                delay={d(2)}
              />
              <NumericCell value={guess.driver.number} feedback={guess.feedback.number} delay={d(3)} />
              <NumericCell
                value={guess.driver.championships}
                feedback={guess.feedback.championships}
                delay={d(4)}
              />
              <NumericCell value={guess.driver.podiums} feedback={guess.feedback.podiums} delay={d(5)} />
              <NumericCell value={guess.driver.wins} feedback={guess.feedback.wins} delay={d(6)} />
              <NumericCell value={guess.driver.debutYear} feedback={guess.feedback.debutYear} delay={d(7)} />
              <Cell
                value={statusText[guess.driver.status] ?? guess.driver.status}
                feedback={guess.feedback.status}
                delay={d(8)}
              />
            </tr>
                )
              })}
        </tbody>
      </table>
    </div>
  )
}
