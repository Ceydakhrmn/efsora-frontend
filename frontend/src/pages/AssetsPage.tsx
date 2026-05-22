import { useEffect, useState } from 'react'
import { Plus, Search, AlertTriangle, Download, Upload, QrCode, ArrowRightLeft, Undo2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { AssetDialog } from '@/components/assets/AssetDialog'
import { AssetQrDialog } from '@/components/assets/AssetQrDialog'
import { AssetTransferDialog } from '@/components/assets/AssetTransferDialog'
import { AssetBulkImportDialog } from '@/components/assets/AssetBulkImportDialog'
import { Pagination } from '@/components/Pagination'
import { assetsApi } from '@/api/assets'
import { usersApi } from '@/api/users'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/i18n'
import { notify } from '@/lib/notify'
import type { Asset, AssetCategory, AssetRequest, AssetStatus, User } from '@/types'
import { exportToExcel } from '@/lib/exportExcel'
import { exportToPdf } from '@/lib/exportPdf'
import { Skeleton } from '@/components/ui/skeleton'

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
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [tagFilter, setTagFilter] = useState<string>('all')
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const categoryLabels: Record<AssetCategory, string> = {
    HARDWARE: t.assets.categoryHardware,
    SOFTWARE_LICENSE: t.assets.categorySoftware,
    API_SUBSCRIPTION: t.assets.categoryApi,
    SAAS_TOOL: t.assets.categorySaas,
    OFFICE_EQUIPMENT: t.assets.categoryOffice,
  }

  const statusConfig: Record<AssetStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    ACTIVE: { label: t.assets.statusActive, variant: 'default' },
    MAINTENANCE: { label: t.assets.statusMaintenance, variant: 'secondary' },
    EXPIRED: { label: t.assets.statusExpired, variant: 'destructive' },
    RETIRED: { label: t.assets.statusRetired, variant: 'outline' },
  }

  const fetchAssets = async () => {
    try {
      const [assetsRes, usersRes, expiringRes, tagsRes] = await Promise.all([
        assetsApi.getAll(page, pageSize),
        usersApi.getAll({ page: 0, size: 1000 }),
        assetsApi.getExpiringSoon(),
        assetsApi.getAllTags(),
      ])
      setAssets(assetsRes.data.content)
      setTotalElements(assetsRes.data.totalElements)
      setTotalPages(assetsRes.data.totalPages)
      setUsers(usersRes.data.content)
      setExpiringSoon(expiringRes.data)
      setAvailableTags(tagsRes.data)
    } catch {
      notify.error(t.assets.loadError)
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
    const matchTag = tagFilter === 'all' || (a.tags || []).includes(tagFilter)
    return matchSearch && matchCat && matchStatus && matchTag
  })

  const handleSubmit = async (data: AssetRequest) => {
    try {
      if (editingAsset) {
        await assetsApi.update(editingAsset.id, data)
        notify.success(t.assets.assetUpdated)
      } else {
        await assetsApi.create(data)
        notify.success(t.assets.assetCreated)
      }
      setDialogOpen(false)
      setEditingAsset(null)
      fetchAssets()
    } catch {
      notify.error(t.assets.saveError)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await assetsApi.delete(id)
      notify.success(t.assets.assetDeleted)
      fetchAssets()
    } catch {
      notify.error(t.assets.deleteError)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3 flex-wrap">
            <Skeleton className="h-10 w-full max-w-sm rounded-md" />
            <Skeleton className="h-10 w-[130px] rounded-md" />
            <Skeleton className="h-10 w-[130px] rounded-md" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-[100px] rounded-md" />
            ))}
          </div>
        </div>
        
        <div className="rounded-md border bg-card">
          <div className="border-b px-4 py-3">
            <div className="flex items-center justify-between">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-[10%] rounded" />
              ))}
            </div>
          </div>
          <div className="divide-y">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-4">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="flex flex-col gap-2 w-[12%]">
                    <Skeleton className="h-4 w-full rounded" />
                    {j === 0 && <Skeleton className="h-3 w-3/4 rounded" />}
                  </div>
                ))}
                <div className="flex justify-end gap-2 w-[10%]">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const handleExport = () => {
    const rows = filtered.map((a) => ({
      ID: a.id,
      [t.assets.name]: a.name,
      [t.assets.category]: categoryLabels[a.category],
      [t.assets.brand]: a.brand || '',
      [t.assets.model]: a.model || '',
      [t.common.status]: statusConfig[a.status].label,
      [t.assets.assignedTo]: a.assignedUserName || '',
      [t.assets.department]: a.assignedDepartment || '',
      [t.assets.purchaseDate]: a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : '',
      [t.assets.price]: a.purchasePrice ?? '',
      [t.assets.renewalDate]: a.renewalDate ? new Date(a.renewalDate).toLocaleDateString() : '',
    }))
    exportToExcel(rows, 'inventory', t.nav.assets)
    notify.success(t.reports.exported)
  }

  const handleExportPdf = () => {
    const cols = [
      'ID', t.assets.name, t.assets.category, t.assets.brand, t.assets.model,
      t.common.status, t.assets.assignedTo, t.assets.department, t.assets.price, t.assets.renewalDate,
    ]
    const rows = filtered.map((a) => [
      a.id, a.name, categoryLabels[a.category], a.brand || '', a.model || '',
      statusConfig[a.status].label, a.assignedUserName || '', a.assignedDepartment || '',
      a.purchasePrice ?? '', a.renewalDate ? new Date(a.renewalDate).toLocaleDateString() : '',
    ])
    exportToPdf(cols, rows, 'inventory', `${t.nav.assets} ${t.reports.departmentReport}`)
    notify.success(t.assets.pdfExported)
  }

  const handleTransfer = async (assetId: number, userId: number) => {
    await assetsApi.transfer(assetId, userId)
    notify.success(t.assets.transferred)
    fetchAssets()
  }

  const handleReturn = async (asset: Asset) => {
    if (!asset.assignedUserId) return
    await assetsApi.returnAsset(asset.id)
    notify.success(t.assets.returned)
    fetchAssets()
  }

  const handleBulkDelete = async () => {
    try {
      await assetsApi.bulkDelete(selectedIds)
      notify.success(t.assets.bulkDeleted)
      setSelectedIds([])
      fetchAssets()
    } catch {
      notify.error(t.assets.deleteError)
    }
  }

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      await assetsApi.bulkUpdateStatus(selectedIds, status)
      notify.success(t.assets.bulkStatusUpdated)
      setSelectedIds([])
      fetchAssets()
    } catch {
      notify.error(t.assets.saveError)
    }
  }

  const toggleSelect = (id: number) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(a => a.id))

  return (
    <div className="space-y-6">

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{expiringSoon.length}</strong> {t.assets.expiringAlert}:{' '}
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
              placeholder={`${t.common.search}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder={t.assets.category} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.assets.allCategories}</SelectItem>
              {Object.entries(categoryLabels).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder={t.common.status} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.assets.allStatuses}</SelectItem>
              <SelectItem value="ACTIVE">{t.assets.statusActive}</SelectItem>
              <SelectItem value="MAINTENANCE">{t.assets.statusMaintenance}</SelectItem>
              <SelectItem value="EXPIRED">{t.assets.statusExpired}</SelectItem>
              <SelectItem value="RETIRED">{t.assets.statusRetired}</SelectItem>
            </SelectContent>
          </Select>
          {availableTags.length > 0 && (
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t.assets.filterByTag} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.assets.allTags}</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>#{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-1" />
              {t.assetImport.importButton}
            </Button>
          )}
          {canEdit && (
            <Button onClick={() => { setEditingAsset(null); setDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-1" />
              {t.assets.addAsset}
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

      {/* Bulk action toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium">{selectedIds.length} {t.assets.selected}</span>
          <div className="flex gap-2 ml-auto">
            <Select onValueChange={handleBulkStatusUpdate}>
              <SelectTrigger className="h-8 w-[160px] text-sm">
                <SelectValue placeholder={t.assets.bulkStatusUpdate} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">{t.assets.statusActive}</SelectItem>
                <SelectItem value="MAINTENANCE">{t.assets.statusMaintenance}</SelectItem>
                <SelectItem value="EXPIRED">{t.assets.statusExpired}</SelectItem>
                <SelectItem value="RETIRED">{t.assets.statusRetired}</SelectItem>
              </SelectContent>
            </Select>
            {canDelete && (
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
                {t.assets.bulkDelete}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 w-10">
                <Checkbox
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left font-medium">{t.assets.name}</th>
              <th className="px-4 py-3 text-left font-medium">{t.assets.category}</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">{t.assets.brandModel}</th>
              <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">{t.assets.assignedTo}</th>
              <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">{t.assets.renewalDate}</th>
              <th className="px-4 py-3 text-left font-medium">{t.common.status}</th>
              <th className="px-4 py-3 text-right font-medium">{t.common.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  {t.assets.noAssets}
                </td>
              </tr>
            ) : (
              filtered.map((asset) => (
                <tr key={asset.id} className={`border-b hover:bg-muted/30 transition-colors ${selectedIds.includes(asset.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.includes(asset.id)}
                      onCheckedChange={() => toggleSelect(asset.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{asset.name}</div>
                    {asset.tags && asset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {asset.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium cursor-pointer hover:bg-primary/20" onClick={() => setTagFilter(tag)}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
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
                      ? new Date(asset.renewalDate).toLocaleDateString()
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
                            title={t.assets.transferTitle}
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                          {asset.assignedUserId && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReturn(asset)}
                              title={t.assets.returned}
                            >
                              <Undo2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setEditingAsset(asset); setDialogOpen(true) }}
                          >
                            {t.common.edit}
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
                          {t.common.delete}
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

      <AssetBulkImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={fetchAssets}
      />
    </div>
  )
}
