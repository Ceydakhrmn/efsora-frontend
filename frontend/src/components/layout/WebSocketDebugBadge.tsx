import { useEffect, useState } from 'react'
import { webSocketService, type WebSocketDebugSnapshot } from '@/lib/websocket'
import { cn } from '@/lib/utils'

function formatAgo(timestamp: number | null): string {
  if (!timestamp) return '-'
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  return `${seconds}s`
}

export function WebSocketDebugBadge() {
  const [snapshot, setSnapshot] = useState<WebSocketDebugSnapshot>(() => webSocketService.getDebugSnapshot())

  useEffect(() => {
    const timer = setInterval(() => {
      setSnapshot(webSocketService.getDebugSnapshot())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const online = snapshot.connected && snapshot.active

  return (
    <div
      className={cn(
        'hidden md:flex items-center gap-2 rounded-lg border px-2 py-1 text-[11px] font-mono',
        online ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-amber-300 bg-amber-50 text-amber-800'
      )}
      title={snapshot.lastError ? `lastError: ${snapshot.lastError}` : 'No WebSocket errors'}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', online ? 'bg-emerald-500' : 'bg-amber-500')} />
      <span>WS {online ? 'up' : 'down'}</span>
      <span>cb:{snapshot.callbacks}</span>
      <span>sub:{snapshot.subscriptions}</span>
      <span>msg:{formatAgo(snapshot.lastMessageAt)}</span>
      {snapshot.pendingConnect && <span>connecting</span>}
    </div>
  )
}
