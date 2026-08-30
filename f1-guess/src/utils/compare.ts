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
  波兰: '欧洲',
  比利时: '欧洲',
  瑞士: '欧洲',
  瑞典: '欧洲',
  丹麦: '欧洲',
  爱尔兰: '欧洲',
  俄罗斯: '欧洲',
  葡萄牙: '欧洲',
  南非: '非洲',
  中国: '亚洲',
  日本: '亚洲',
  泰国: '亚洲',
  印度: '亚洲',
  印度尼西亚: '亚洲',
  加拿大: '北美',
  美国: '北美',
  墨西哥: '北美',
  阿根廷: '南美',
  巴西: '南美',
  哥伦比亚: '南美',
  委内瑞拉: '南美',
  澳大利亚: '大洋洲',
  新西兰: '大洋洲',
  匈牙利: '欧洲',
  捷克: '欧洲',
  智利: '南美',
  马来西亚: '亚洲',
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

// 车队血缘链：同一支车队历代更名视为同一车队（每行一条链，现役队名放最后）
// 注：Lotus 因混淆了经典 Team Lotus 与 2012-15 Enstone 时期，不做归并
const teamChains: string[][] = [
  ['Stewart', 'Jaguar', 'Red Bull', 'Red Bull Racing'],
  ['Minardi', 'Toro Rosso', 'AlphaTauri', 'RB', 'Racing Bulls'],
  ['BAR', 'Honda', 'Brawn', 'Mercedes'],
  ['Jordan', 'Midland', 'Spyker', 'Force India', 'Racing Point', 'Aston Martin'],
  ['Toleman', 'Benetton', 'Renault', 'Alpine'],
  ['Sauber', 'BMW Sauber', 'Alfa Romeo', 'Audi'],
  ['Team Lotus', 'Caterham'],
  ['Virgin', 'Marussia', 'Manor'],
]

function canonicalTeam(team: string): string {
  for (const chain of teamChains) {
    if (chain.includes(team)) return chain[chain.length - 1]
  }
  return team
}

// 接近 = 谜底车手曾效力过该车队（含历代更名），但现已不在
function compareTeam(guessTeam: string, target: Driver): FeedbackType {
  if (guessTeam === target.team) return 'correct'
  const g = canonicalTeam(guessTeam)
  return target.teams.some((t) => canonicalTeam(t) === g) ? 'close' : 'wrong'
}

export function compareDrivers(guess: Driver, target: Driver): GuessFeedback {
  return {
    nationality: compareNationality(guess.nationality, target.nationality),
    team: compareTeam(guess.team, target),
    number: compareNumeric(guess.number, target.number, 1),
    championships: compareNumeric(guess.championships, target.championships, 1),
    podiums: compareNumeric(guess.podiums, target.podiums, 1),
    wins: compareNumeric(guess.wins, target.wins, 1),
    starts: compareNumeric(guess.starts, target.starts, 10),
    debutYear: compareNumeric(guess.debutYear, target.debutYear, 1),
    status: guess.status === target.status ? 'correct' : 'wrong',
  }
}
