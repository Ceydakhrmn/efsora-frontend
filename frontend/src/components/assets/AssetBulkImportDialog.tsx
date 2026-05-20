import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/i18n'
import { notify } from '@/lib/notify'
import { assetsApi } from '@/api/assets'
import type { AssetRequest } from '@/types'

interface AssetBulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface ParsedRow {
  name: string
  category: string
  brand: string
  model: string
  vendor: string
  status: string
  purchaseDate: string
  purchasePrice: string
  assignedDepartment: string
  notes: string
}

interface ImportResult {
  row: number
  name: string
  status: 'success' | 'error'
  message?: string
}

const VALID_CATEGORIES = ['HARDWARE', 'SOFTWARE_LICENSE', 'API_SUBSCRIPTION', 'SAAS_TOOL', 'OFFICE_EQUIPMENT']
const VALID_STATUSES = ['ACTIVE', 'MAINTENANCE', 'EXPIRED', 'RETIRED']

export function AssetBulkImportDialog({ open, onOpenChange, onSuccess }: AssetBulkImportDialogProps) {
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [results, setResults] = useState<ImportResult[] | null>(null)
  const [importing, setImporting] = useState(false)
  const [fileName, setFileName] = useState('')

  const reset = () => {
    setParsedRows([])
    setResults(null)
    setFileName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setResults(null)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
      if (lines.length < 2) {
        notify.error(t.assetImport.invalidFile)
        return
      }

      const header = lines[0].split(/[,;\t]/).map((h) => h.trim().toLowerCase())
      const idx = (terms: string[]) => header.findIndex((h) => terms.some((term) => h.includes(term)))

      const nameIdx = idx(['name', 'ad', 'varlık'])
      const catIdx = idx(['category', 'kategori', 'cat'])
      const brandIdx = idx(['brand', 'marka'])
      const modelIdx = idx(['model'])
      const vendorIdx = idx(['vendor', 'tedarik', 'supplier'])
      const statusIdx = idx(['status', 'durum'])
      const dateIdx = idx(['purchasedate', 'purchase_date', 'satinalma', 'tarih'])
      const priceIdx = idx(['price', 'fiyat', 'purchaseprice'])
      const deptIdx = idx(['department', 'dept', 'departman'])
      const notesIdx = idx(['notes', 'notlar', 'note'])

      if (nameIdx === -1) {
        notify.error(t.assetImport.noNameColumn)
        return
      }

      const col = (cols: string[], i: number) => (i >= 0 ? cols[i]?.trim() || '' : '')

      const rows: ParsedRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/[,;\t]/)
        const name = col(cols, nameIdx)
        if (!name) continue
        rows.push({
          name,
          category: col(cols, catIdx).toUpperCase() || 'HARDWARE',
          brand: col(cols, brandIdx),
          model: col(cols, modelIdx),
          vendor: col(cols, vendorIdx),
          status: col(cols, statusIdx).toUpperCase() || 'ACTIVE',
          purchaseDate: col(cols, dateIdx),
          purchasePrice: col(cols, priceIdx),
          assignedDepartment: col(cols, deptIdx),
          notes: col(cols, notesIdx),
        })
      }
      setParsedRows(rows)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (parsedRows.length === 0) return
    setImporting(true)
    try {
      const payload: Partial<AssetRequest>[] = parsedRows.map((r) => ({
        name: r.name,
        category: (VALID_CATEGORIES.includes(r.category) ? r.category : 'HARDWARE') as AssetRequest['category'],
        brand: r.brand || undefined,
        model: r.model || undefined,
        vendor: r.vendor || undefined,
        status: (VALID_STATUSES.includes(r.status) ? r.status : 'ACTIVE') as AssetRequest['status'],
        purchaseDate: r.purchaseDate || undefined,
        purchasePrice: r.purchasePrice ? parseFloat(r.purchasePrice) : undefined,
        assignedDepartment: r.assignedDepartment || undefined,
        notes: r.notes || undefined,
      }))

      const { data } = await assetsApi.bulkImport(payload)
      setResults(data.results.map((r) => ({ ...r, status: r.status as 'success' | 'error' })))
      if (data.success > 0) {
        notify.success(`${data.success} ${t.assetImport.imported}`)
        onSuccess()
      }
      if (data.failed > 0) {
        notify.error(`${data.failed} ${t.assetImport.failed}`)
      }
    } catch {
      notify.error(t.common.error)
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t.assetImport.title}
          </DialogTitle>
          <DialogDescription>{t.assetImport.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt,.tsv"
              className="hidden"
              onChange={handleFileChange}
            />
            <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            {fileName ? (
              <p className="text-sm font-medium">{fileName}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{t.assetImport.dropzone}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{t.assetImport.format}</p>
          </div>

          {/* Preview */}
          {parsedRows.length > 0 && !results && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{parsedRows.length} {t.assetImport.rowsFound}</p>
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? t.common.loading : t.assetImport.startImport}
                </Button>
              </div>
              <ScrollArea className="h-[220px] rounded border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">{t.assets.name}</th>
                      <th className="px-3 py-2 text-left">{t.assets.category}</th>
                      <th className="px-3 py-2 text-left">{t.assets.brand}</th>
                      <th className="px-3 py-2 text-left">{t.common.status}</th>
                      <th className="px-3 py-2 text-left">{t.assets.assignedDepartment}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2 font-medium">{row.name}</td>
                        <td className="px-3 py-2">{row.category}</td>
                        <td className="px-3 py-2">{row.brand || '—'}</td>
                        <td className="px-3 py-2">{row.status}</td>
                        <td className="px-3 py-2">{row.assignedDepartment || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </>
          )}

          {/* Results */}
          {results && (
            <ScrollArea className="h-[220px] rounded border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">{t.assets.name}</th>
                    <th className="px-3 py-2 text-left">{t.common.status}</th>
                    <th className="px-3 py-2 text-left">{t.assetImport.message}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.row} className="border-b">
                      <td className="px-3 py-2">{r.row}</td>
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2">
                        {r.status === 'success'
                          ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                          : <XCircle className="h-4 w-4 text-red-500" />}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{r.message || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}

          {/* Template hint */}
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">{t.assetImport.templateHint}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
