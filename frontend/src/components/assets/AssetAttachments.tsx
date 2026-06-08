import { useState, useRef } from 'react'
import { Upload, Download, Trash2, FileText, Image, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { assetsApi } from '@/api/assets'
import { notify } from '@/lib/notify'
import type { AssetAttachment } from '@/types'
import { useI18n } from '@/i18n'
import { useFetch } from '@/hooks/useFetch'

interface AssetAttachmentsProps {
  assetId: number
  canEdit: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileIcon(contentType: string) {
  if (contentType.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />
  if (contentType === 'application/pdf') return <FileText className="h-4 w-4 text-red-500" />
  return <File className="h-4 w-4 text-gray-500" />
}

export function AssetAttachments({ assetId, canEdit }: AssetAttachmentsProps) {
  const { t } = useI18n()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, refetch: fetchAttachments } = useFetch<AssetAttachment[]>(
    () => assetsApi.getAttachments(assetId).then(r => r.data),
    [assetId]
  )
  const attachments = data ?? []

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      notify.error(t.assets.fileSizeError)
      return
    }
    setUploading(true)
    try {
      await assetsApi.uploadAttachment(assetId, file)
      notify.success(t.assets.fileUploaded)
      fetchAttachments()
    } catch {
      notify.error(t.assets.fileUploadError)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDownload = async (attachment: AssetAttachment) => {
    try {
      const res = await assetsApi.downloadAttachment(attachment.id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', attachment.fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      notify.error(t.assets.fileDownloadError)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await assetsApi.deleteAttachment(id)
      notify.success(t.assets.fileDeleted)
      fetchAttachments()
    } catch {
      notify.error(t.assets.fileDeleteError)
    }
  }

  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{t.assets.attachments}</h4>
        {canEdit && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              onChange={handleUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3 w-3 mr-1" />
              {uploading ? t.common.loading : t.assets.addFile}
            </Button>
          </div>
        )}
      </div>

      {attachments.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t.assets.noAttachments}</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                {getFileIcon(a.contentType)}
                <span className="truncate">{a.fileName}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  ({formatFileSize(a.fileSize)})
                </span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => handleDownload(a)}>
                  <Download className="h-3 w-3" />
                </Button>
                {canEdit && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(a.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
