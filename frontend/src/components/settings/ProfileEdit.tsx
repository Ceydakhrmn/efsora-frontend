import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { usersApi } from '@/api/users'
import { useI18n } from '@/i18n'
import { notify } from '@/lib/notify'
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.profilePhoto || null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      department: user?.department || '',
    },
  })

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.size > 2 * 1024 * 1024) {
      notify.error('Photo must be under 2MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      setPhotoPreview(base64)
      setUploadingPhoto(true)
      try {
        await usersApi.uploadPhoto(user.id, base64)
        updateUser({ ...user, profilePhoto: base64 })
        notify.success('Profile photo updated!')
      } catch {
        notify.error('Failed to upload photo')
        setPhotoPreview(user.profilePhoto || null)
      } finally {
        setUploadingPhoto(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = async () => {
    if (!user) return
    setUploadingPhoto(true)
    try {
      await usersApi.uploadPhoto(user.id, '')
      setPhotoPreview(null)
      updateUser({ ...user, profilePhoto: undefined })
      notify.success('Profile photo removed')
    } catch {
      notify.error('Failed to remove photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return
    try {
      await usersApi.update(user.id, {
        ...data,
        email: user.email,
        password: 'placeholder123',
      })
      updateUser({ ...user, ...data })
      notify.success(t.settings.profileUpdated)
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      notify.error(axiosError.response?.data?.message || t.common.error)
    }
  }

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '??'

  return (
    <div className="space-y-6">
      {/* Fotoğraf Yükleme */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            {photoPreview && <AvatarImage src={photoPreview} alt="Profile" />}
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          {uploadingPhoto && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
            >
              <Camera className="h-4 w-4 mr-1" />
              {photoPreview ? 'Change Photo' : 'Upload Photo'}
            </Button>
            {photoPreview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemovePhoto}
                disabled={uploadingPhoto}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPG, PNG or GIF · Max 2MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      {/* Form */}
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
    </div>
  )
}