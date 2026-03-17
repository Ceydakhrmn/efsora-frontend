import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { usersApi } from '@/api/users'
import { useI18n } from '@/i18n'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ErrorResponse } from '@/types'

const departments = ['IT', 'Engineering', 'HR', 'Finance', 'Marketing', 'Sales']

const profileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  department: z.string().min(1),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfileEdit() {
  const { user, updateUser } = useAuth()
  const { t } = useI18n()

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      department: user?.department || '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return
    try {
      await usersApi.update(user.id, {
        ...data,
        email: user.email,
        password: 'placeholder123',
      })
      updateUser({ ...user, ...data })
      toast.success(t.settings.profileUpdated)
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      toast.error(axiosError.response?.data?.message || t.common.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>{t.auth.firstName}</Label>
          <Input {...register('firstName')} />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>{t.auth.lastName}</Label>
          <Input {...register('lastName')} />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t.auth.email}</Label>
        <Input value={user?.email || ''} disabled className="opacity-60" />
      </div>

      <div className="space-y-2">
        <Label>{t.auth.department}</Label>
        <Select defaultValue={user?.department} onValueChange={(value) => setValue('department', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.common.save}
      </Button>
    </form>
  )
}
