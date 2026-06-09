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
import { useI18n } from '@/i18n'

const schema = z.object({
  email: z.string().email(),
  role: z.string().min(1),
})

type FormData = z.infer<typeof schema>

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const { t } = useI18n()
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
      notify.success(t.users.inviteSuccess)
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      const message = axiosError.response?.data?.message || t.users.inviteError
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
          <DialogTitle>{t.users.inviteUser}</DialogTitle>
          <DialogDescription>
            {t.users.inviteDescription}
          </DialogDescription>
        </DialogHeader>

        {inviteLink ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t.users.inviteLinkCreated}</p>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="text-xs" />
              <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleClose}>{t.common.close}</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>{t.users.inviteEmail}</Label>
              <Input type="email" placeholder={t.auth.emailPlaceholder} {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t.users.inviteRole}</Label>
              <Select defaultValue="USER" onValueChange={(value) => setValue('role', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">{t.users.roleUser}</SelectItem>
                  <SelectItem value="EDITOR">{t.users.roleEditor}</SelectItem>
                  <SelectItem value="ADMIN">{t.users.roleAdmin}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>{t.common.cancel}</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.users.inviteSend}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
