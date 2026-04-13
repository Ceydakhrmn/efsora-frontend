import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Asset, AssetRequest, User } from '@/types'
import { AssetAttachments } from './AssetAttachments'
import { AssetAssignmentHistory } from './AssetAssignmentHistory'

const schema = z.object({
  name: z.string().min(1, 'Ad gerekli'),
  category: z.enum(['HARDWARE', 'SOFTWARE_LICENSE', 'API_SUBSCRIPTION', 'SAAS_TOOL', 'OFFICE_EQUIPMENT']),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  vendor: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.string().optional(),
  renewalDate: z.string().optional(),
  warrantyExpiryDate: z.string().optional(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'EXPIRED', 'RETIRED']),
  seatCount: z.string().optional(),
  assignedUserId: z.string().optional(),
  assignedDepartment: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const categories = [
  { value: 'HARDWARE', label: 'Donanım' },
  { value: 'SOFTWARE_LICENSE', label: 'Yazılım Lisansı' },
  { value: 'API_SUBSCRIPTION', label: 'API Aboneliği' },
  { value: 'SAAS_TOOL', label: 'SaaS Araç' },
  { value: 'OFFICE_EQUIPMENT', label: 'Ofis Ekipmanı' },
]

const statuses = [
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'MAINTENANCE', label: 'Bakımda' },
  { value: 'EXPIRED', label: 'Süresi Doldu' },
  { value: 'RETIRED', label: 'Hurdaya Çıktı' },
]

const departments = ['IT', 'Engineering', 'HR', 'Finance', 'Marketing', 'Sales']

interface AssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: Asset | null
  users: User[]
  canEdit?: boolean
  onSubmit: (data: AssetRequest) => Promise<void>
}

export function AssetDialog({ open, onOpenChange, asset, users, canEdit = true, onSubmit }: AssetDialogProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'ACTIVE', category: 'HARDWARE' },
  })

  const category = watch('category')

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      ...data,
      purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : undefined,
      seatCount: data.seatCount ? parseInt(data.seatCount) : undefined,
      assignedUserId: data.assignedUserId ? parseInt(data.assignedUserId) : undefined,
    } as AssetRequest)
  }

  useEffect(() => {
    if (asset) {
      reset({
        name: asset.name,
        category: asset.category,
        brand: asset.brand || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        vendor: asset.vendor || '',
        purchaseDate: asset.purchaseDate || '',
        purchasePrice: asset.purchasePrice?.toString() || '',
        renewalDate: asset.renewalDate || '',
        warrantyExpiryDate: asset.warrantyExpiryDate || '',
        status: asset.status,
        seatCount: asset.seatCount?.toString() || '',
        assignedUserId: asset.assignedUserId?.toString() || '',
        assignedDepartment: asset.assignedDepartment || '',
        notes: asset.notes || '',
      })
    } else {
      reset({ status: 'ACTIVE', category: 'HARDWARE' })
    }
  }, [asset, open, reset])

  const showRenewal = ['SOFTWARE_LICENSE', 'API_SUBSCRIPTION', 'SAAS_TOOL'].includes(category)
  const showSeats = ['SOFTWARE_LICENSE', 'SAAS_TOOL'].includes(category)
  const showSerial = category === 'HARDWARE'
  const showWarranty = category === 'HARDWARE'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? 'Varlık Düzenle' : 'Yeni Varlık Ekle'}</DialogTitle>
          <DialogDescription>Envanter varlığı bilgilerini girin.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2 col-span-2">
              <Label>Ad *</Label>
              <Input {...register('name')} placeholder="MacBook Pro M3" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Select defaultValue={asset?.category || 'HARDWARE'} onValueChange={(v) => setValue('category', v as FormData['category'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Durum *</Label>
              <Select defaultValue={asset?.status || 'ACTIVE'} onValueChange={(v) => setValue('status', v as FormData['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Marka</Label>
              <Input {...register('brand')} placeholder="Apple" />
            </div>

            <div className="space-y-2">
              <Label>Model</Label>
              <Input {...register('model')} placeholder="MacBook Pro 14" />
            </div>

            <div className="space-y-2">
              <Label>Tedarikçi</Label>
              <Input {...register('vendor')} placeholder="İTÜ Teknoloji" />
            </div>

            <div className="space-y-2">
              <Label>Satın Alma Tarihi</Label>
              <Input type="date" {...register('purchaseDate')} />
            </div>

            <div className="space-y-2">
              <Label>Fiyat (₺)</Label>
              <Input type="number" step="0.01" {...register('purchasePrice')} placeholder="0.00" />
            </div>

            {showSerial && (
              <div className="space-y-2">
                <Label>Seri No</Label>
                <Input {...register('serialNumber')} placeholder="SN123456" />
              </div>
            )}

            {showWarranty && (
              <div className="space-y-2">
                <Label>Garanti Bitiş</Label>
                <Input type="date" {...register('warrantyExpiryDate')} />
              </div>
            )}

            {showRenewal && (
              <div className="space-y-2">
                <Label>Yenileme Tarihi</Label>
                <Input type="date" {...register('renewalDate')} />
              </div>
            )}

            {showSeats && (
              <div className="space-y-2">
                <Label>Koltuk Sayısı</Label>
                <Input type="number" {...register('seatCount')} placeholder="10" />
              </div>
            )}
          </div>

          <div className="border-t pt-4 grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Atanan Kullanıcı</Label>
              <Select
                defaultValue={asset?.assignedUserId?.toString() || 'none'}
                onValueChange={(v) => setValue('assignedUserId', v === 'none' ? undefined : v)}
              >
                <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Yok —</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.firstName} {u.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Atanan Departman</Label>
              <Select
                defaultValue={asset?.assignedDepartment || 'none'}
                onValueChange={(v) => setValue('assignedDepartment', v === 'none' ? '' : v)}
              >
                <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Yok —</SelectItem>
                  {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Notlar</Label>
              <Input {...register('notes')} placeholder="Ek bilgiler..." />
            </div>
          </div>

          {asset && (
            <AssetAttachments assetId={asset.id} canEdit={canEdit} />
          )}

          {asset && (
            <AssetAssignmentHistory assetId={asset.id} />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
