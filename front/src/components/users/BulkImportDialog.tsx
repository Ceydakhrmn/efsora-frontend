import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/i18n'
import { notify } from '@/lib/notify'
import { usersApi } from '@/api/users'
import type { UserRequest } from '@/types'

interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface ParsedRow {
  firstName: string
  lastName: string
  email: string
  password: string
  department: string
  role: string
}

interface ImportResult {
  row: number
  email: string
  status: 'success' | 'error'
  message?: string
}

export function BulkImportDialog({ open, onOpenChange, onSuccess }: BulkImportDialogProps) {
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
        notify.error(t.bulkImport.invalidFile)
        return
      }

      const header = lines[0].split(/[,;\t]/).map((h) => h.trim().toLowerCase())
      const emailIdx = header.findIndex((h) => h.includes('email') || h.includes('e-posta'))
      const firstIdx = header.findIndex((h) => h.includes('first') || h === 'ad' || h === 'firstname')
      const lastIdx = header.findIndex((h) => h.includes('last') || h === 'soyad' || h === 'lastname')
      const passIdx = header.findIndex((h) => h.includes('pass') || h.includes('şifre') || h.includes('sifre'))
      const deptIdx = header.findIndex((h) => h.includes('dept') || h.includes('departman') || h.includes('department'))
      const roleIdx = header.findIndex((h) => h.includes('rol') || h.includes('role'))

      if (emailIdx === -1) {
        notify.error(t.bulkImport.noEmailColumn)
        return
      }

      const rows: ParsedRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/[,;\t]/).map((c) => c.trim())
        const email = cols[emailIdx] || ''
        if (!email || !email.includes('@')) continue

        rows.push({
          firstName: firstIdx >= 0 ? cols[firstIdx] || '' : '',
          lastName: lastIdx >= 0 ? cols[lastIdx] || '' : '',
          email,
          password: passIdx >= 0 ? cols[passIdx] || 'Efsora123!' : 'Efsora123!',
          department: deptIdx >= 0 ? cols[deptIdx] || '' : '',
          role: roleIdx >= 0 ? (cols[roleIdx] || 'USER').toUpperCase() : 'USER',
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
      const payload: UserRequest[] = parsedRows.map((r) => ({
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        password: r.password,
        department: r.department,
        role: r.role,
      }))
      const { data } = await usersApi.bulkImport(payload)
      setResults(data.results.map((r: { row: number; email: string; status: string; message?: string }) => ({
        ...r,
        status: r.status as 'success' | 'error',
      })))
      if (data.success > 0) {
        notify.success(`${data.success} ${t.bulkImport.usersImported}`)
        onSuccess()
      }
      if (data.failed > 0) {
        notify.error(`${data.failed} ${t.bulkImport.usersFailed}`)
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
            {t.bulkImport.title}
          </DialogTitle>
          <DialogDescription>{t.bulkImport.description}</DialogDescription>
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
              <p className="text-sm text-muted-foreground">{t.bulkImport.dropzone}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{t.bulkImport.format}</p>
          </div>

          {/* Preview Table */}
          {parsedRows.length > 0 && !results && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {parsedRows.length} {t.bulkImport.rowsFound}
                </p>
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? t.common.loading : t.bulkImport.startImport}
                </Button>
              </div>
              <ScrollArea className="h-[250px] rounded border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">{t.auth.firstName}</th>
                      <th className="px-3 py-2 text-left">{t.auth.lastName}</th>
                      <th className="px-3 py-2 text-left">{t.auth.email}</th>
                      <th className="px-3 py-2 text-left">{t.auth.department}</th>
                      <th className="px-3 py-2 text-left">{t.users.role}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2">{row.firstName}</td>
                        <td className="px-3 py-2">{row.lastName}</td>
                        <td className="px-3 py-2">{row.email}</td>
                        <td className="px-3 py-2">{row.department}</td>
                        <td className="px-3 py-2">{row.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </>
          )}

          {/* Results */}
          {results && (
            <ScrollArea className="h-[250px] rounded border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">{t.auth.email}</th>
                    <th className="px-3 py-2 text-left">{t.common.status}</th>
                    <th className="px-3 py-2 text-left">{t.bulkImport.message}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.row} className="border-b">
                      <td className="px-3 py-2">{r.row}</td>
                      <td className="px-3 py-2">{r.email}</td>
                      <td className="px-3 py-2">
                        {r.status === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
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
            <p className="text-xs text-muted-foreground">{t.bulkImport.templateHint}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
