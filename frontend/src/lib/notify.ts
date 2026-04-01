import { toast } from 'sonner'
import { addNotification } from '@/hooks/useNotifications'

export const notify = {
  success: (message: string) => {
    toast.success(message)
    addNotification('success', message)
  },
  error: (message: string) => {
    toast.error(message)
    addNotification('error', message)
  },
  info: (message: string) => {
    toast.info(message)
    addNotification('info', message)
  },
  warning: (message: string) => {
    toast.warning(message)
    addNotification('warning', message)
  },
}
