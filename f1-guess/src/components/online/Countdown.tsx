interface CountdownProps {
  remaining: number
}

export function Countdown({ remaining }: CountdownProps) {
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  let colorClass = 'text-f1-text'
  let bgClass = 'bg-f1-card border-2 border-white/10'

  if (remaining <= 10) {
    colorClass = 'text-f1-red animate-pulse'
    bgClass = 'bg-f1-red/20 border-2 border-f1-red'
  } else if (remaining <= 30) {
    colorClass = 'text-f1-yellow'
    bgClass = 'bg-f1-yellow/20 border-2 border-f1-yellow'
  }

  return (
    <div className={`inline-block px-6 py-3 rounded-lg ${bgClass}`}>
      <div className={`text-4xl font-black italic tabular-nums tracking-wide ${colorClass}`}>{timeText}</div>
    </div>
  )
}
