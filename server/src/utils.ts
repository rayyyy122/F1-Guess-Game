import type { Driver, GameMode } from './types'
import driversData from './drivers.json'

export const drivers = driversData as Driver[]

// 简单版池子：2022 年起在围场出过场的车手 + 拿过世界冠军的退役传奇
// 与前端 f1-guess/src/utils/drivers.ts 的过滤逻辑保持一致
export const easyDrivers: Driver[] = drivers.filter(
  (d) => d.status !== 'retired' || d.championships >= 1 || (d.lastYear ?? 0) >= 2022
)

export function getDriversByMode(mode: GameMode): Driver[] {
  return mode === 'easy' ? easyDrivers : drivers
}

export function getRandomDriver(pool: Driver[]): Driver {
  return pool[Math.floor(Math.random() * pool.length)]
}

export function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generatePlayerId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}
