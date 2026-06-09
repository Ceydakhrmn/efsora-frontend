
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Download, Mail, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserTable } from '@/components/users/UserTable'
import { UserDialog } from '@/components/users/UserDialog'
import { InviteDialog } from '@/components/users/InviteDialog'
import { BulkImportDialog } from '@/components/users/BulkImportDialog'
import { Pagination } from '@/components/Pagination'
import { usersApi } from '@/api/users'
import type { UsersQueryParams } from '@/api/users'
import { useI18n } from '@/i18n'
import { useAuth } from '@/contexts/AuthContext'
import { notify } from '@/lib/notify'
import type { User, UserRequest } from '@/types'
import type { AxiosError } from 'axios'
import type { ErrorResponse } from '@/types'
import { exportToExcel } from '@/lib/exportExcel'
import { exportToPdf } from '@/lib/exportPdf'
import { UserTableSkeleton } from '@/components/users/UserTableSkeleton'



import { DEPARTMENTS, ROLES, DEFAULT_PAGE_SIZE } from '@/lib/constants'

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const { t } = useI18n()
  const { startImpersonation } = useAuth()

  const statuses = [
    { value: 'all', label: t.common.all },
    { value: 'active', label: t.common.active },
    { value: 'inactive', label: t.common.inactive },
  ]
  const navigate = useNavigate()

  const handleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => checked ? [...prev, id] : prev.filter((x) => x !== id))
  }
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredUsers.map((u) => u.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    try {
      await usersApi.deleteBulk(selectedIds)
      notify.success(t.users.userDeleted)
      setSelectedIds([])
      fetchUsers()
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      notify.error(axiosError.response?.data?.message || t.common.error)
    }
  }

  const fetchUsers = useCallback(async () => {
    try {
      const params: UsersQueryParams = { page, size: pageSize }
      if (deptFilter !== 'all') params.department = deptFilter
      if (roleFilter !== 'all') params.role = roleFilter
      if (statusFilter !== 'all') params.active = statusFilter === 'active' ? true : false
      if (search) params.search = search
      const response = await usersApi.getAll(params)
      setUsers(response.data.content)
      setTotalElements(response.data.totalElements)
      setTotalPages(response.data.totalPages)
    } catch {
      notify.error(t.common.error)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, deptFilter, roleFilter, statusFilter, search, t])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = users

  const handleCreate = async (data: UserRequest) => {
    try {
      await usersApi.create(data)
      notify.success(t.users.userCreated)
      setDialogOpen(false)
      fetchUsers()
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      notify.error(axiosError.response?.data?.message || t.common.error)
    }
  }

  const handleUpdate = async (data: UserRequest) => {
    if (!editingUser) return
    try {
      await usersApi.update(editingUser.id, data)
      notify.success(t.users.userUpdated)
      setEditingUser(null)
      setDialogOpen(false)
      fetchUsers()
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      notify.error(axiosError.response?.data?.message || t.common.error)
    }
  }

  const handleDeactivate = async (id: number) => {
    try {
      await usersApi.deactivate(id)
      notify.success(t.users.userDeactivated)
      fetchUsers()
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      notify.error(axiosError.response?.data?.message || t.common.error)
    }
  }

  const handlePermanentDelete = async (id: number) => {
    try {
      await usersApi.deletePermanent(id)
      notify.success(t.users.userDeleted)
      fetchUsers()
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      notify.error(axiosError.response?.data?.message || t.common.error)
    }
  }

  const handleImpersonate = async (user: User) => {
    try {
      const response = await usersApi.impersonate(user.id)
      startImpersonation(response.data)
      navigate('/dashboard')
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      notify.error(axiosError.response?.data?.message || t.common.error)
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

  const handleExport = () => {
    const rows = filteredUsers.map((u) => ({
      ID: u.id,
      [t.auth.firstName]: u.firstName,
      [t.auth.lastName]: u.lastName,
      [t.auth.email]: u.email,
      [t.auth.department]: u.department || '',
      [t.common.status]: u.active ? t.common.active : t.common.inactive,
      [t.users.registrationDate]: new Date(u.registrationDate).toLocaleDateString(),
    }))
    exportToExcel(rows, 'users', t.nav.users)
    notify.success(t.users.export + ' ✓')
  }

  const handleExportPdf = () => {
    const cols = ['ID', t.auth.firstName, t.auth.lastName, t.auth.email, t.auth.department, t.common.status, t.users.registrationDate]
    const rows = filteredUsers.map((u) => [
      u.id, u.firstName, u.lastName, u.email,
      u.department || '', u.active ? t.common.active : t.common.inactive,
      new Date(u.registrationDate).toLocaleDateString(),
    ])
    exportToPdf(cols, rows, 'users', t.users.title)
    notify.success(t.assets.pdfExported)
  }

  if (loading) return <UserTableSkeleton />

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
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
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t.common.filter} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t.users.role} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t.common.status} />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Excel
          </Button>
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => setBulkImportOpen(true)}>
            <Upload className="h-4 w-4 mr-1" />
            {t.bulkImport.importUsers}
          </Button>
          <Button variant="outline" onClick={() => setInviteDialogOpen(true)}>
            <Mail className="h-4 w-4 mr-1" />
            {t.users.inviteUser}
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t.users.addUser}
          </Button>
          <Button
            variant="destructive"
            disabled={selectedIds.length === 0}
            onClick={handleBulkDelete}
          >
            {t.users.permanentDelete} ({selectedIds.length})
          </Button>
        </div>
      </div>

      {/* Table */}
      <UserTable
        users={filteredUsers}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        onEdit={openEdit}
        onDeactivate={handleDeactivate}
        onPermanentDelete={handlePermanentDelete}
        onImpersonate={handleImpersonate}
        onRowClick={(user) => navigate(`/users/${user.id}`)}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalElements={totalElements}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Invite Dialog */}
      <InviteDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />

      {/* Bulk Import Dialog */}
      <BulkImportDialog open={bulkImportOpen} onOpenChange={setBulkImportOpen} onSuccess={fetchUsers} />

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
