import type { Driver } from '../types'
import driversData from '../data/drivers.json'

export const drivers: Driver[] = driversData as Driver[]

export function getRandomDriver(excludeId?: string): Driver {
  const pool = excludeId ? drivers.filter((d) => d.id !== excludeId) : drivers
  return pool[Math.floor(Math.random() * pool.length)]
}

export function searchDrivers(query: string, limit = 8): Driver[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return drivers
    .filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.nameCn?.includes(q) ||
        d.nationality.includes(q) ||
        d.team.toLowerCase().includes(q)
    )
    .slice(0, limit)
}

export function getDriverById(id: string): Driver | undefined {
  return drivers.find((d) => d.id === id)
}
