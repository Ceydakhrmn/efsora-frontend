import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '@/contexts/AuthContext'

function getTimeSlot() {
  return Math.floor(Date.now() / 30000)
}

function getSecondsLeft() {
  return 30 - (Math.floor(Date.now() / 1000) % 30)
}

export function MFASettings() {
  const { user } = useAuth()
  const [timeSlot, setTimeSlot] = useState(getTimeSlot())
  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSlot(getTimeSlot())
      setSecondsLeft(getSecondsLeft())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!user) return null

  const qrValue = `EFSORA|ID:${user.id}|EMAIL:${user.email}|SLOT:${timeSlot}`

  const radius = 20
  const circumference = 2 * Math.PI * radius
  const progress = circumference - (secondsLeft / 30) * circumference

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Oturumunuza ait QR kod. Her 30 saniyede bir yenilenir. Çıkış yapıp tekrar giriş yaptığınızda yeni bir kod üretilir.
      </p>
      <div className="flex flex-col items-center gap-3">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <QRCodeSVG value={qrValue} size={180} level="M" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg width="48" height="48" className="-rotate-90">
            <circle cx="24" cy="24" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
            <circle
              cx="24" cy="24" r={radius} fill="none"
              stroke="hsl(var(--primary))" strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="font-mono text-base">{secondsLeft}s</span>
        </div>
        <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
      </div>
    </div>
  )
}
