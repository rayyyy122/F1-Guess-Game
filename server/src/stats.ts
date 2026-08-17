export interface GlobalStatsData {
  roomsCreated: number
  gamesStarted: number
  gamesFinished: number
  totalGuesses: number
  updatedAt: number
}

const DEFAULT_STATS: Omit<GlobalStatsData, 'updatedAt'> = {
  roomsCreated: 0,
  gamesStarted: 0,
  gamesFinished: 0,
  totalGuesses: 0,
}

// 允许打点的计数器白名单
// 注：不做「当前在线人数」计数——客户端异常断开时 close 事件可能丢失，
// 计数只增不减会失真。实时在线访客以 Cloudflare Web Analytics 为准。
const TRACKABLE_KEYS = [
  'roomsCreated',
  'gamesStarted',
  'gamesFinished',
  'totalGuesses',
] as const

type TrackableKey = (typeof TRACKABLE_KEYS)[number]

export class GlobalStats implements DurableObject {
  private state: DurableObjectState
  private data: GlobalStatsData | null = null

  constructor(state: DurableObjectState) {
    this.state = state
  }

  private async load() {
    if (!this.data) {
      this.data = (await this.state.storage.get<GlobalStatsData>('stats')) || {
        ...DEFAULT_STATS,
        updatedAt: Date.now(),
      }
      // 清理已下线的 onlinePlayers 字段（该计数因 close 事件不可靠已移除）
      delete (this.data as unknown as Record<string, unknown>).onlinePlayers
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    await this.load()

    if (url.pathname === '/incr' && request.method === 'POST') {
      const body = (await request.json()) as { key?: string; delta?: number }
      if (!body.key || !TRACKABLE_KEYS.includes(body.key as TrackableKey)) {
        return new Response('Invalid key', { status: 400 })
      }
      const key = body.key as TrackableKey
      const delta = typeof body.delta === 'number' ? body.delta : 1
      this.data![key] = Math.max(0, this.data![key] + delta)
      this.data!.updatedAt = Date.now()
      await this.state.storage.put('stats', this.data)
      return new Response('ok')
    }

    if (url.pathname === '/get') {
      return new Response(JSON.stringify(this.data), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response('Not found', { status: 404 })
  }
}
