import type { Driver, GuessFeedback, FeedbackType, NumericFeedback } from '../types'

const nationalityToContinent: Record<string, string> = {
  英国: '欧洲',
  意大利: '欧洲',
  法国: '欧洲',
  德国: '欧洲',
  西班牙: '欧洲',
  荷兰: '欧洲',
  芬兰: '欧洲',
  奥地利: '欧洲',
  摩纳哥: '欧洲',
  南非: '非洲',
  中国: '亚洲',
  日本: '亚洲',
  泰国: '亚洲',
  加拿大: '北美',
  美国: '北美',
  墨西哥: '北美',
  阿根廷: '南美',
  巴西: '南美',
  澳大利亚: '大洋洲',
  新西兰: '大洋洲',
}

function compareNationality(guess: string, target: string): FeedbackType {
  if (guess === target) return 'correct'
  const guessContinent = nationalityToContinent[guess]
  const targetContinent = nationalityToContinent[target]
  if (guessContinent && targetContinent && guessContinent === targetContinent) return 'close'
  return 'wrong'
}

function compareNumeric(guess: number, target: number, closeThreshold: number): NumericFeedback {
  const direction = guess === target ? 'equal' : guess < target ? 'up' : 'down'
  let type: FeedbackType
  if (guess === target) type = 'correct'
  else if (Math.abs(guess - target) <= closeThreshold) type = 'close'
  else type = 'wrong'
  return { type, direction }
}

export function compareDrivers(guess: Driver, target: Driver): GuessFeedback {
  return {
    nationality: compareNationality(guess.nationality, target.nationality),
    team:
      guess.team === target.team
        ? 'correct'
        : guess.teams.some((t) => target.teams.includes(t))
          ? 'close'
          : 'wrong',
    number: compareNumeric(guess.number, target.number, 1),
    championships: compareNumeric(guess.championships, target.championships, 1),
    podiums: compareNumeric(guess.podiums, target.podiums, 1),
    wins: compareNumeric(guess.wins, target.wins, 1),
    debutYear: compareNumeric(guess.debutYear, target.debutYear, 1),
    active: guess.active === target.active ? 'correct' : 'wrong',
  }
}
