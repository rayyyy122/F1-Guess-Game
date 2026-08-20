import { GameRoom } from './room'
import { GlobalStats } from './stats'
import type { GlobalStatsData } from './stats'
import { renderStatsPage } from './statsPage'
import { generateRoomId } from './utils'

export { GameRoom, GlobalStats }

export interface Env {
  ROOMS: DurableObjectNamespace
  STATS: DurableObjectNamespace
  ANNOUNCE_TOKEN?: string
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

    // 统计数据只读接口：浏览器访问返回可视化页面，程序访问返回 JSON
    if (url.pathname === '/stats' && request.method === 'GET') {
      const id = env.STATS.idFromName('global')
      const stub = env.STATS.get(id)
      const res = await stub.fetch('https://stats.internal/get')
      const data = await res.text()

      if (request.headers.get('Accept')?.includes('text/html')) {
        const html = renderStatsPage(JSON.parse(data) as GlobalStatsData)
        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      }

      return new Response(data, {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    // 公告：GET 公开 / POST 发布（DO 内鉴权）
    if (url.pathname === '/announcements') {
      const id = env.STATS.idFromName('global')
      const stub = env.STATS.get(id)
      const res = await stub.fetch('https://stats.internal/announcements', request)
      return new Response(res.body, {
        status: res.status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    // 页面卸载时的 sendBeacon 离开通知：让服务端立即结算，对手无需等重连窗口
    const roomLeaveMatch = url.pathname.match(/^\/room\/([A-Z]{6})\/leave$/)
    if (roomLeaveMatch && request.method === 'POST') {
      const roomId = roomLeaveMatch[1]
      const id = env.ROOMS.idFromName(roomId)
      const stub = env.ROOMS.get(id)

      const doUrl = new URL(request.url)
      doUrl.pathname = '/leave'
      doUrl.searchParams.set('roomId', roomId)

      return stub.fetch(doUrl.toString(), request)
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
