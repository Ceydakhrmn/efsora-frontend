import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/i18n'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ErrorResponse } from '@/types'

const departments = ['IT', 'Engineering', 'HR', 'Finance', 'Marketing', 'Sales']

const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  department: z.string().min(1),
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm(_props: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register: registerUser } = useAuth()
  const { t } = useI18n()

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)
    try {
      await registerUser(data)
      toast.success(t.auth.registerSuccess)
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      if (axiosError.response?.status === 400 || axiosError.response?.status === 409) {
        const msg = axiosError.response?.data?.message || ''
        if (msg.toLowerCase().includes('email')) {
          setError(t.auth.emailExists)
        } else {
          setError(msg || t.common.error)
        }
      } else {
        setError(axiosError.response?.data?.message || t.common.error)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="reg-firstName">{t.auth.firstName}</Label>
          <Input id="reg-firstName" placeholder="Ahmet" {...register('firstName')} />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-lastName">{t.auth.lastName}</Label>
          <Input id="reg-lastName" placeholder="Yilmaz" {...register('lastName')} />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-email">{t.auth.email}</Label>
        <Input id="reg-email" type="email" placeholder="ahmet@efsora.com" {...register('email')} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-department">{t.auth.department}</Label>
        <Select onValueChange={(value) => setValue('department', value)}>
          <SelectTrigger>
            <SelectValue placeholder={t.auth.department} />
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
        <Label htmlFor="reg-password">{t.auth.password}</Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.common.loading}
          </>
        ) : (
          t.auth.register
        )}
      </Button>
    </form>
  )
}
