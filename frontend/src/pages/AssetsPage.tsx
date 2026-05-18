import { useEffect, useState } from 'react'
import { Plus, Search, AlertTriangle, Download, QrCode, ArrowRightLeft, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AssetDialog } from '@/components/assets/AssetDialog'
import { AssetQrDialog } from '@/components/assets/AssetQrDialog'
import { AssetTransferDialog } from '@/components/assets/AssetTransferDialog'
import { Pagination } from '@/components/Pagination'
import { assetsApi } from '@/api/assets'
import { usersApi } from '@/api/users'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/i18n'
import { notify } from '@/lib/notify'
import type { Asset, AssetCategory, AssetRequest, AssetStatus, User } from '@/types'
import { exportToExcel } from '@/lib/exportExcel'
import { exportToPdf } from '@/lib/exportPdf'

const categoryLabels: Record<AssetCategory, string> = {
  HARDWARE: 'Donanım',
  SOFTWARE_LICENSE: 'Yazılım Lisansı',
  API_SUBSCRIPTION: 'API Aboneliği',
  SAAS_TOOL: 'SaaS Araç',
  OFFICE_EQUIPMENT: 'Ofis Ekipmanı',
}

const statusConfig: Record<AssetStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ACTIVE: { label: 'Aktif', variant: 'default' },
  MAINTENANCE: { label: 'Bakımda', variant: 'secondary' },
  EXPIRED: { label: 'Süresi Doldu', variant: 'destructive' },
  RETIRED: { label: 'Hurdaya Çıktı', variant: 'outline' },
}

export function AssetsPage() {
  const { user: authUser } = useAuth()
  const { t } = useI18n()
  const canEdit = authUser?.role === 'ADMIN' || authUser?.role === 'EDITOR'
  const canDelete = authUser?.role === 'ADMIN'
  const [assets, setAssets] = useState<Asset[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [expiringSoon, setExpiringSoon] = useState<Asset[]>([])
  const [qrAsset, setQrAsset] = useState<Asset | null>(null)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [transferAsset, setTransferAsset] = useState<Asset | null>(null)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const fetchAssets = async () => {
    try {
      const [assetsRes, usersRes, expiringRes] = await Promise.all([
        assetsApi.getAll(page, pageSize),
        usersApi.getAll({ page: 0, size: 1000 }),
        assetsApi.getExpiringSoon(),
      ])
      setAssets(assetsRes.data.content)
      setTotalElements(assetsRes.data.totalElements)
      setTotalPages(assetsRes.data.totalPages)
      setUsers(usersRes.data.content)
      setExpiringSoon(expiringRes.data)
    } catch {
      notify.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAssets() }, [page, pageSize])

  const filtered = assets.filter((a) => {
    const matchSearch = search === '' ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.brand || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.vendor || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || a.category === categoryFilter
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchCat && matchStatus
  })

  const handleSubmit = async (data: AssetRequest) => {
    try {
      if (editingAsset) {
        await assetsApi.update(editingAsset.id, data)
        notify.success('Varlık güncellendi')
      } else {
        await assetsApi.create(data)
        notify.success('Varlık eklendi')
      }
      setDialogOpen(false)
      setEditingAsset(null)
      fetchAssets()
    } catch {
      notify.error('İşlem başarısız')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await assetsApi.delete(id)
      notify.success('Varlık silindi')
      fetchAssets()
    } catch {
      notify.error('Silinemedi')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const handleExport = () => {
    const rows = filtered.map((a) => ({
      ID: a.id,
      'Ad': a.name,
      'Kategori': categoryLabels[a.category],
      'Marka': a.brand || '',
      'Model': a.model || '',
      'Durum': statusConfig[a.status].label,
      'Atanan Kullanıcı': a.assignedUserName || '',
      'Departman': a.assignedDepartment || '',
      'Satın Alma Tarihi': a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString('tr-TR') : '',
      'Fiyat (₺)': a.purchasePrice ?? '',
      'Yenileme Tarihi': a.renewalDate ? new Date(a.renewalDate).toLocaleDateString('tr-TR') : '',
    }))
    exportToExcel(rows, 'envanter', 'Envanter')
    notify.success('Envanter dışa aktarıldı')
  }

  const handleExportPdf = () => {
    const cols = ['ID', 'Ad', 'Kategori', 'Marka', 'Model', 'Durum', 'Atanan', 'Departman', 'Fiyat (₺)', 'Yenileme']
    const rows = filtered.map((a) => [
      a.id, a.name, categoryLabels[a.category], a.brand || '', a.model || '',
      statusConfig[a.status].label, a.assignedUserName || '', a.assignedDepartment || '',
      a.purchasePrice ?? '', a.renewalDate ? new Date(a.renewalDate).toLocaleDateString('tr-TR') : '',
    ])
    exportToPdf(cols, rows, 'envanter', 'Envanter Listesi')
    notify.success('PDF oluşturuldu')
  }

  const handleTransfer = async (assetId: number, userId: number) => {
    await assetsApi.transfer(assetId, userId)
    notify.success('Varlık devredildi')
    fetchAssets()
  }

  const handleReturn = async (asset: Asset) => {
    if (!asset.assignedUserId) return
    await assetsApi.returnAsset(asset.id)
    notify.success('Varlık iade edildi')
    fetchAssets()
  }

  return (
    <div className="space-y-6">

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{expiringSoon.length}</strong> varlığın yenileme tarihi 30 gün içinde doluyor:{' '}
            {expiringSoon.map((a) => a.name).join(', ')}
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {Object.entries(categoryLabels).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Durum" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="MAINTENANCE">Bakımda</SelectItem>
              <SelectItem value="EXPIRED">Süresi Doldu</SelectItem>
              <SelectItem value="RETIRED">Hurdaya Çıktı</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Excel
          </Button>
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
          {canEdit && (
            <Button onClick={() => { setEditingAsset(null); setDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-1" />
              Varlık Ekle
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(categoryLabels).map(([cat, label]) => {
          const count = assets.filter((a) => a.category === cat).length
          return (
            <div key={cat} className="rounded-lg border bg-card p-3 text-center">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Ad</th>
              <th className="px-4 py-3 text-left font-medium">Kategori</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Marka / Model</th>
              <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Atanan</th>
              <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Yenileme</th>
              <th className="px-4 py-3 text-left font-medium">Durum</th>
              <th className="px-4 py-3 text-right font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  Varlık bulunamadı
                </td>
              </tr>
            ) : (
              filtered.map((asset) => (
                <tr key={asset.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{asset.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">{categoryLabels[asset.category]}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {[asset.brand, asset.model].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {asset.assignedUserName || asset.assignedDepartment || '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {asset.renewalDate
                      ? new Date(asset.renewalDate).toLocaleDateString('tr-TR')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusConfig[asset.status].variant}>
                      {statusConfig[asset.status].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setQrAsset(asset); setQrDialogOpen(true) }}
                        title={t.assets.showQr}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      {canEdit && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setTransferAsset(asset); setTransferDialogOpen(true) }}
                            title="Devret"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                          {asset.assignedUserId && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReturn(asset)}
                              title="İade Et"
                            >
                              <Undo2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setEditingAsset(asset); setDialogOpen(true) }}
                          >
                            Düzenle
                          </Button>
                        </>
                      )}
                      {canDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(asset.id)}
                        >
                          Sil
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalElements={totalElements}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <AssetDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingAsset(null) }}
        asset={editingAsset}
        users={users}
        canEdit={canEdit}
        onSubmit={handleSubmit}
      />

      <AssetQrDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        asset={qrAsset}
      />

      <AssetTransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        asset={transferAsset}
        users={users}
        onTransfer={handleTransfer}
      />
    </div>
  )
}
