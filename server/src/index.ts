import { GameRoom } from './room'
import { generateRoomId } from './utils'

export { GameRoom }

export interface Env {
  ROOMS: DurableObjectNamespace
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return handleOptions()
    }

    const url = new URL(request.url)

    if (url.pathname === '/create' && request.method === 'POST') {
      const roomId = generateRoomId()
      const id = env.ROOMS.idFromName(roomId)
      const stub = env.ROOMS.get(id)

      const wsUrl = new URL(request.url)
      wsUrl.pathname = '/room'
      wsUrl.searchParams.set('playerName', url.searchParams.get('playerName') || 'Player')

      const response = await stub.fetch(wsUrl.toString(), request)
      if (!response.ok) {
        return jsonResponse({ error: 'Failed to create room' }, 500)
      }

      return jsonResponse({ roomId })
    }

    const roomMatch = url.pathname.match(/^\/room\/([A-Z]{6})$/)
    if (roomMatch) {
      const roomId = roomMatch[1]
      const id = env.ROOMS.idFromName(roomId)
      const stub = env.ROOMS.get(id)

      const doUrl = new URL(request.url)
      doUrl.pathname = '/room'

      return stub.fetch(doUrl.toString(), request)
    }

    if (url.pathname === '/health') {
      return jsonResponse({ status: 'ok', timestamp: Date.now() })
    }

    return jsonResponse({ error: 'Not found' }, 404)
  },
}
