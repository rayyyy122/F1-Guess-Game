import { GameRoom } from './room'
import { GlobalStats } from './stats'
import { generateRoomId } from './utils'

export { GameRoom, GlobalStats }

export interface Env {
  ROOMS: DurableObjectNamespace
  STATS: DurableObjectNamespace
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function handleOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function track(env: Env, ctx: ExecutionContext, key: string, delta = 1) {
  const id = env.STATS.idFromName('global')
  const stub = env.STATS.get(id)
  ctx.waitUntil(
    stub.fetch('https://stats.internal/incr', {
      method: 'POST',
      body: JSON.stringify({ key, delta }),
    })
  )
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return handleOptions()
    }

    const url = new URL(request.url)

    if (url.pathname === '/create' && request.method === 'POST') {
      const roomId = generateRoomId()
      track(env, ctx, 'roomsCreated')
      return jsonResponse({ roomId })
    }

    // 统计数据只读接口
    if (url.pathname === '/stats' && request.method === 'GET') {
      const id = env.STATS.idFromName('global')
      const stub = env.STATS.get(id)
      const res = await stub.fetch('https://stats.internal/get')
      const data = await res.text()
      return new Response(data, {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const roomMatch = url.pathname.match(/^\/room\/([A-Z]{6})$/)
    if (roomMatch) {
      const roomId = roomMatch[1]
      const id = env.ROOMS.idFromName(roomId)
      const stub = env.ROOMS.get(id)

      const doUrl = new URL(request.url)
      doUrl.pathname = '/room'
      doUrl.searchParams.set('roomId', roomId)

      return stub.fetch(doUrl.toString(), request)
    }

    if (url.pathname === '/health') {
      return jsonResponse({ status: 'ok', timestamp: Date.now() })
    }

    return jsonResponse({ error: 'Not found' }, 404)
  },
}
