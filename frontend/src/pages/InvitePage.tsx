import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { invitationsApi } from '@/api/invitations'
import { notify } from '@/lib/notify'

const departments = ['IT', 'Engineering', 'HR', 'Finance', 'Marketing', 'Sales']

const schema = z.object({
  firstName: z.string().min(2, 'En az 2 karakter'),
  lastName: z.string().min(2, 'En az 2 karakter'),
  password: z.string().min(8, 'En az 8 karakter'),
  department: z.string().min(1, 'Departman seçin'),
})

type FormData = z.infer<typeof schema>

type Status = 'loading' | 'valid' | 'invalid'

export function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('loading')
  const [inviteData, setInviteData] = useState<{ email: string; role: string } | null>(null)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!token) { setStatus('invalid'); return }
    invitationsApi.verify(token)
      .then((res) => {
        setInviteData({ email: res.data.email, role: res.data.role })
        setStatus('valid')
      })
      .catch(() => setStatus('invalid'))
  }, [token])

  const onSubmit = async (data: FormData) => {
    if (!token) return
    try {
      const res = await invitationsApi.accept(token, data)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('refreshToken', res.data.refreshToken)
      localStorage.setItem('user', JSON.stringify({
        email: res.data.email,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
      }))
      notify.success('Hesabınız oluşturuldu!')
      navigate('/dashboard')
    } catch {
      notify.error('Bir hata oluştu, tekrar deneyin.')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Geçersiz veya süresi dolmuş davet</h1>
          <p className="text-muted-foreground text-sm">Bu davet linki artık kullanılamaz.</p>
          <Button variant="outline" onClick={() => navigate('/auth')}>Giriş Yap</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Hesabınızı Oluşturun</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {inviteData?.email} adresine davet edildiniz
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Ad</Label>
              <Input {...register('firstName')} placeholder="Ad" />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Soyad</Label>
              <Input {...register('lastName')} placeholder="Soyad" />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={inviteData?.email} disabled />
          </div>

          <div className="space-y-2">
            <Label>Departman</Label>
            <Select onValueChange={(value) => setValue('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Departman seçin" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Şifre</Label>
            <Input type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hesap Oluştur'}
          </Button>
        </form>
      </div>
    </div>
  )
}
