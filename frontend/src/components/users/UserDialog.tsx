import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useI18n } from '@/i18n'
import type { User, UserRequest } from '@/types'

const departments = ['IT', 'Engineering', 'HR', 'Finance', 'Marketing', 'Sales']

const userSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  department: z.string().min(1),
})

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSubmit: (data: UserRequest) => Promise<void>
}

export function UserDialog({ open, onOpenChange, user, onSubmit }: UserDialogProps) {
  const { t } = useI18n()
  const isEditing = !!user

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<UserRequest>({
    resolver: zodResolver(
      isEditing
        ? userSchema.extend({ password: z.string().min(8).max(100).or(z.literal('')) })
        : userSchema
    ),
  })

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        department: user.department,
      })
    } else {
      reset({ firstName: '', lastName: '', email: '', password: '', department: '' })
    }
  }, [user, open, reset])

  const handleFormSubmit = async (data: UserRequest) => {
    if (isEditing && !data.password) {
      data.password = 'placeholder123'
    }
    await onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t.users.editUser : t.users.addUser}</DialogTitle>
          <DialogDescription>
            {isEditing ? t.users.editUser : t.users.addUser}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
            <Input type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t.auth.department}</Label>
            <Select
              defaultValue={user?.department}
              onValueChange={(value) => setValue('department', value)}
            >
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
            <Label>{t.auth.password} {isEditing && <span className="text-muted-foreground text-xs">(opsiyonel)</span>}</Label>
            <Input type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.common.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
