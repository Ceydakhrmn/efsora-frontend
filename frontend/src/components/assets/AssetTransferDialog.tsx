import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRightLeft } from 'lucide-react'
import type { Asset, User } from '@/types'

interface AssetTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: Asset | null
  users: User[]
  onTransfer: (assetId: number, userId: number) => Promise<void>
}

export function AssetTransferDialog({ open, onOpenChange, asset, users, onTransfer }: AssetTransferDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  if (!asset) return null

  const availableUsers = users.filter(u => u.active && u.id !== asset.assignedUserId)

  const handleTransfer = async () => {
    if (!selectedUserId) return
    setLoading(true)
    try {
      await onTransfer(asset.id, Number(selectedUserId))
      setSelectedUserId('')
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); setSelectedUserId('') }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Varlık Devret
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-muted px-3 py-2 text-sm">
            <p className="font-medium">{asset.name}</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              Şu an: {asset.assignedUserName || 'Atanmamış'}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium">Devredilecek kullanıcı</p>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Kullanıcı seçin..." />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map(u => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.firstName} {u.lastName}
                    {u.department && <span className="text-muted-foreground ml-1">— {u.department}</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
          <Button onClick={handleTransfer} disabled={!selectedUserId || loading}>
            Devret
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
