import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserTable } from '@/components/users/UserTable'
import { UserDialog } from '@/components/users/UserDialog'
import { usersApi } from '@/api/users'
import { useI18n } from '@/i18n'
import { toast } from 'sonner'
import type { User, UserRequest } from '@/types'
import type { AxiosError } from 'axios'
import type { ErrorResponse } from '@/types'

const departments = ['IT', 'Engineering', 'HR', 'Finance', 'Marketing', 'Sales']

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const { t } = useI18n()
  const navigate = useNavigate()

  const fetchUsers = async () => {
    try {
      const response = await usersApi.getAll()
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      search === '' ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesDept = deptFilter === 'all' || user.department === deptFilter
    return matchesSearch && matchesDept
  })

  const handleCreate = async (data: UserRequest) => {
    try {
      await usersApi.create(data)
      toast.success(t.users.userCreated)
      setDialogOpen(false)
      fetchUsers()
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      toast.error(axiosError.response?.data?.message || t.common.error)
    }
  }

  const handleUpdate = async (data: UserRequest) => {
    if (!editingUser) return
    try {
      await usersApi.update(editingUser.id, data)
      toast.success(t.users.userUpdated)
      setEditingUser(null)
      setDialogOpen(false)
      fetchUsers()
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      toast.error(axiosError.response?.data?.message || t.common.error)
    }
  }

  const handleDeactivate = async (id: number) => {
    try {
      await usersApi.deactivate(id)
      toast.success(t.users.userDeactivated)
      fetchUsers()
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      toast.error(axiosError.response?.data?.message || t.common.error)
    }
  }

  const handlePermanentDelete = async (id: number) => {
    try {
      await usersApi.deletePermanent(id)
      toast.success(t.users.userDeleted)
      fetchUsers()
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      toast.error(axiosError.response?.data?.message || t.common.error)
    }
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    setDialogOpen(true)
  }

  const openCreate = () => {
    setEditingUser(null)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.common.search + '...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t.common.filter} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t.users.addUser}
        </Button>
      </div>

      {/* Table */}
      <UserTable
        users={filteredUsers}
        onEdit={openEdit}
        onDeactivate={handleDeactivate}
        onPermanentDelete={handlePermanentDelete}
        onRowClick={(user) => navigate(`/users/${user.id}`)}
      />

      {/* Create/Edit Dialog */}
      <UserDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingUser(null)
        }}
        user={editingUser}
        onSubmit={editingUser ? handleUpdate : handleCreate}
      />
    </div>
  )
}
