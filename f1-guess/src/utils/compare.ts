import type { Driver, GuessFeedback, FeedbackType } from '../types'

function compareNumber(guess: number, target: number, closeThreshold: number): FeedbackType {
  if (guess === target) return 'correct'
  if (Math.abs(guess - target) <= closeThreshold) return 'close'
  return 'wrong'
}

export function compareDrivers(guess: Driver, target: Driver): GuessFeedback {
  return {
    nationality: guess.nationality === target.nationality ? 'correct' : 'wrong',
    team:
      guess.team === target.team
        ? 'correct'
        : guess.teams.some((t) => target.teams.includes(t))
          ? 'close'
          : 'wrong',
    number: guess.number === target.number ? 'correct' : 'wrong',
    championships: compareNumber(guess.championships, target.championships, 1),
    podiums: compareNumber(guess.podiums, target.podiums, 10),
    wins: compareNumber(guess.wins, target.wins, 5),
    debutYear: compareNumber(guess.debutYear, target.debutYear, 1),
    active: guess.active === target.active ? 'correct' : 'wrong',
  }
}
