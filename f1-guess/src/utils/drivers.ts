import type { Driver } from '../types'
import driversData from '../data/drivers.json'

export const drivers: Driver[] = driversData as Driver[]

export type SoloMode = 'classic' | 'easy'

// 简单版池子：2022 年起在围场出过场的车手（现役/储备/2022 年后退役）
// + 拿过世界冠军的退役传奇
export const easyDrivers: Driver[] = drivers.filter(
  (d) => d.status !== 'retired' || d.championships >= 1 || (d.lastYear ?? 0) >= 2022
)

export function getDriversByMode(mode: SoloMode): Driver[] {
  return mode === 'easy' ? easyDrivers : drivers
}

export function getRandomDriver(pool: Driver[], excludeId?: string): Driver {
  const candidates = excludeId ? pool.filter((d) => d.id !== excludeId) : pool
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function getDriverById(id: string): Driver | undefined {
  return drivers.find((d) => d.id === id)
}

// 去掉音调符号并转小写（é→e、ü→u 等），让英文键盘也能搜到带特殊字符的名字
function normalizeName(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function searchDrivers(query: string, limit = 8, pool: Driver[] = drivers): Driver[] {
  if (!query.trim()) return []
  const q = normalizeName(query)
  return pool
    .filter((d) => normalizeName(d.name).includes(q) || d.nameCn?.includes(query.trim()))
    .slice(0, limit)
}
