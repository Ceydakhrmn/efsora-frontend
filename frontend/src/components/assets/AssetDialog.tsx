import { useEffect, useMemo, useState } from 'react'
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
import { AssetDepreciation } from './AssetDepreciation'
import { AssetTagInput } from './AssetTagInput'
import { useI18n } from '@/i18n'

const schema = z.object({
  name: z.string().min(1),
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
  usefulLifeYears: z.string().optional(),
  assignedUserId: z.string().optional(),
  assignedDepartment: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

import { DEPARTMENTS } from '@/lib/constants'

interface AssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: Asset | null
  users: User[]
  canEdit?: boolean
  onSubmit: (data: AssetRequest) => Promise<void>
}

export function AssetDialog({ open, onOpenChange, asset, users, canEdit = true, onSubmit }: AssetDialogProps) {
  const { t } = useI18n()
  const [tags, setTags] = useState<string[]>([])
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'ACTIVE', category: 'HARDWARE' },
  })

  const category = watch('category')

  const categories = useMemo(() => [
    { value: 'HARDWARE', label: t.assets.categoryHardware },
    { value: 'SOFTWARE_LICENSE', label: t.assets.categorySoftware },
    { value: 'API_SUBSCRIPTION', label: t.assets.categoryApi },
    { value: 'SAAS_TOOL', label: t.assets.categorySaas },
    { value: 'OFFICE_EQUIPMENT', label: t.assets.categoryOffice },
  ], [t])

  const statuses = useMemo(() => [
    { value: 'ACTIVE', label: t.assets.statusActive },
    { value: 'MAINTENANCE', label: t.assets.statusMaintenance },
    { value: 'EXPIRED', label: t.assets.statusExpired },
    { value: 'RETIRED', label: t.assets.statusRetired },
  ], [t])

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      ...data,
      purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : undefined,
      seatCount: data.seatCount ? parseInt(data.seatCount) : undefined,
      usefulLifeYears: data.usefulLifeYears ? parseInt(data.usefulLifeYears) : undefined,
      assignedUserId: data.assignedUserId ? parseInt(data.assignedUserId) : undefined,
      tags,
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
        usefulLifeYears: asset.usefulLifeYears?.toString() || '',
        assignedUserId: asset.assignedUserId?.toString() || '',
        assignedDepartment: asset.assignedDepartment || '',
        notes: asset.notes || '',
      })
      setTags(asset.tags || [])
    } else {
      reset({ status: 'ACTIVE', category: 'HARDWARE' })
      setTags([])
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
          <DialogTitle>{asset ? t.assets.editAsset : t.assets.addAsset}</DialogTitle>
          <DialogDescription>{t.assets.dialogDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2 col-span-2">
              <Label>{t.assets.name} *</Label>
              <Input {...register('name')} placeholder="MacBook Pro M3" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t.assets.category} *</Label>
              <Select defaultValue={asset?.category || 'HARDWARE'} onValueChange={(v) => setValue('category', v as FormData['category'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.common.status} *</Label>
              <Select defaultValue={asset?.status || 'ACTIVE'} onValueChange={(v) => setValue('status', v as FormData['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.assets.brand}</Label>
              <Input {...register('brand')} placeholder="Apple" />
            </div>

            <div className="space-y-2">
              <Label>{t.assets.model}</Label>
              <Input {...register('model')} placeholder="MacBook Pro 14" />
            </div>

            <div className="space-y-2">
              <Label>{t.assets.vendor}</Label>
              <Input {...register('vendor')} placeholder="Acme Corp" />
            </div>

            <div className="space-y-2">
              <Label>{t.assets.purchaseDate}</Label>
              <Input type="date" {...register('purchaseDate')} />
            </div>

            <div className="space-y-2">
              <Label>{t.assets.price}</Label>
              <Input type="number" step="0.01" {...register('purchasePrice')} placeholder="0.00" />
            </div>

            <div className="space-y-2">
              <Label>{t.assets.usefulLifeYears}</Label>
              <Input type="number" min="1" max="50" {...register('usefulLifeYears')} placeholder="5" />
            </div>

            {showSerial && (
              <div className="space-y-2">
                <Label>{t.assets.serialNumber}</Label>
                <Input {...register('serialNumber')} placeholder="SN123456" />
              </div>
            )}

            {showWarranty && (
              <div className="space-y-2">
                <Label>{t.assets.warrantyExpiry}</Label>
                <Input type="date" {...register('warrantyExpiryDate')} />
              </div>
            )}

            {showRenewal && (
              <div className="space-y-2">
                <Label>{t.assets.renewalDate}</Label>
                <Input type="date" {...register('renewalDate')} />
              </div>
            )}

            {showSeats && (
              <div className="space-y-2">
                <Label>{t.assets.seatCount}</Label>
                <Input type="number" {...register('seatCount')} placeholder="10" />
              </div>
            )}
          </div>

          <div className="border-t pt-4 grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t.assets.assignedUser}</Label>
              <Select
                defaultValue={asset?.assignedUserId?.toString() || 'none'}
                onValueChange={(v) => setValue('assignedUserId', v === 'none' ? undefined : v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.assets.none}</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.firstName} {u.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.assets.assignedDepartment}</Label>
              <Select
                defaultValue={asset?.assignedDepartment || 'none'}
                onValueChange={(v) => setValue('assignedDepartment', v === 'none' ? '' : v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.assets.none}</SelectItem>
                  {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>{t.assets.tags}</Label>
              <AssetTagInput value={tags} onChange={setTags} disabled={!canEdit} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>{t.assets.notes}</Label>
              <Input {...register('notes')} />
            </div>
          </div>

          {asset && (
            <AssetAttachments assetId={asset.id} canEdit={canEdit} />
          )}

          {asset && (
            <AssetAssignmentHistory assetId={asset.id} />
          )}

          {asset && (
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <span>{t.assets.depreciationTab}</span>
              </p>
              <AssetDepreciation assetId={asset.id} />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t.common.cancel}</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.common.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
