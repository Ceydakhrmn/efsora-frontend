import { useCallback, useEffect, useState } from 'react'
import { Plus, Search, AlertTriangle, Download, Upload, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AssetDialog } from '@/components/assets/AssetDialog'
import { AssetQrDialog } from '@/components/assets/AssetQrDialog'
import { AssetTransferDialog } from '@/components/assets/AssetTransferDialog'
import { AssetBulkImportDialog } from '@/components/assets/AssetBulkImportDialog'
import { AssetStats } from '@/components/assets/AssetStats'
import { AssetTable } from '@/components/assets/AssetTable'
import { AssetCardList } from '@/components/assets/AssetCardList'
import { AssetTableSkeleton } from '@/components/assets/AssetTableSkeleton'
import { Pagination } from '@/components/Pagination'
import { assetsApi } from '@/api/assets'
import { usersApi } from '@/api/users'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/i18n'
import { notify } from '@/lib/notify'
import type { Asset, AssetCategory, AssetRequest, AssetStatus, User } from '@/types'
import { exportToExcel } from '@/lib/exportExcel'
import { exportToPdf } from '@/lib/exportPdf'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'


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
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
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

  const fetchAssets = useCallback(async () => {
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
  }, [page, pageSize, t])

  useEffect(() => { fetchAssets() }, [fetchAssets])

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

  const toggleSelect = (id: number) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(a => a.id))

  if (loading) return <AssetTableSkeleton />

  return (
    <div className="space-y-6">

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

      <AssetStats assets={assets} categoryLabels={categoryLabels} />

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

      <AssetCardList
        assets={filtered}
        selectedIds={selectedIds}
        canEdit={canEdit}
        canDelete={canDelete}
        categoryLabels={categoryLabels}
        statusConfig={statusConfig}
        onToggleSelect={toggleSelect}
        onQr={(asset) => { setQrAsset(asset); setQrDialogOpen(true) }}
        onTransfer={(asset) => { setTransferAsset(asset); setTransferDialogOpen(true) }}
        onReturn={handleReturn}
        onEdit={(asset) => { setEditingAsset(asset); setDialogOpen(true) }}
        onDelete={handleDelete}
        onTagFilter={setTagFilter}
      />

      <AssetTable
        assets={filtered}
        selectedIds={selectedIds}
        canEdit={canEdit}
        canDelete={canDelete}
        categoryLabels={categoryLabels}
        statusConfig={statusConfig}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onQr={(asset) => { setQrAsset(asset); setQrDialogOpen(true) }}
        onTransfer={(asset) => { setTransferAsset(asset); setTransferDialogOpen(true) }}
        onReturn={handleReturn}
        onEdit={(asset) => { setEditingAsset(asset); setDialogOpen(true) }}
        onDelete={handleDelete}
        onTagFilter={setTagFilter}
      />

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
