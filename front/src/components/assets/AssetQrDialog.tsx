import { QRCodeSVG } from 'qrcode.react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useI18n } from '@/i18n'
import type { Asset } from '@/types'

interface AssetQrDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: Asset | null
}

export function AssetQrDialog({ open, onOpenChange, asset }: AssetQrDialogProps) {
  const { t } = useI18n()
  if (!asset) return null

  const qrData = `EFSORA-ASSET|ID:${asset.id}|${asset.name}${asset.serialNumber ? `|SN:${asset.serialNumber}` : ''}`

  const handleDownload = () => {
    const svg = document.getElementById('asset-qr-svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx?.drawImage(img, 0, 0)
      const link = document.createElement('a')
      link.download = `asset-${asset.id}-qr.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.assets.qrCode} — {asset.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              id="asset-qr-svg"
              value={qrData}
              size={220}
              level="M"
              includeMargin
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{asset.name}</p>
            {asset.serialNumber && <p>SN: {asset.serialNumber}</p>}
            <p>ID: {asset.id}</p>
          </div>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            {t.assets.downloadQr}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
