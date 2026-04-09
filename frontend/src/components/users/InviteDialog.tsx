import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Copy, Check } from 'lucide-react'
import type { AxiosError } from 'axios'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { invitationsApi } from '@/api/invitations'
import { notify } from '@/lib/notify'

const schema = z.object({
  email: z.string().email('Geçerli bir email girin'),
  role: z.string().min(1),
})

type FormData = z.infer<typeof schema>

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'USER' },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await invitationsApi.create(data.email, data.role)
      const link = `${window.location.origin}/invite/${res.data.token}`
      setInviteLink(link)
      notify.success('Davet linki oluşturuldu')
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      const message = axiosError.response?.data?.message || 'Davet gönderilemedi'
      notify.error(message)
    }
  }

  const handleCopy = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setInviteLink(null)
    setCopied(false)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kullanıcı Davet Et</DialogTitle>
          <DialogDescription>
            Davet linki oluşturarak kullanıcının sisteme katılmasını sağlayın.
          </DialogDescription>
        </DialogHeader>

        {inviteLink ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Davet linki oluşturuldu. Bu linki kullanıcıyla paylaşın:</p>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="text-xs" />
              <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Kapat</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="kullanici@efsora.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <Select defaultValue="USER" onValueChange={(value) => setValue('role', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>İptal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Davet Gönder'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
