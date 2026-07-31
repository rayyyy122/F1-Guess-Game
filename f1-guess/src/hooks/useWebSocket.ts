import { useEffect, useRef, useState, useCallback } from 'react'

interface UseWebSocketOptions {
  onMessage: (data: any) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
}

export function useWebSocket(url: string | null, options: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const optionsRef = useRef(options)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const urlRef = useRef(url)
  const manualCloseRef = useRef(false)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    urlRef.current = url
    if (url) {
      manualCloseRef.current = false
    }
  }, [url])

  const connect = useCallback(() => {
    const currentUrl = urlRef.current
    if (!currentUrl) return

    try {
      const ws = new WebSocket(currentUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
        optionsRef.current.onOpen?.()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          optionsRef.current.onMessage(data)
        } catch (err) {
          console.error('Failed to parse message:', err)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        optionsRef.current.onClose?.()

        if (manualCloseRef.current) return
        if (!urlRef.current) return

        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
          reconnectAttemptsRef.current++
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect()
          }, delay)
        }
      }

      ws.onerror = (error) => {
        optionsRef.current.onError?.(error)
      }
    } catch (err) {
      console.error('WebSocket connection error:', err)
    }
  }, [])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect, url])

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  const close = useCallback(() => {
    manualCloseRef.current = true
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
  }, [])

  return { isConnected, send, close }
}
