import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAppData } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import UserAvatar from '../components/UserAvatar'
import { formatDate } from '../utils/format'

export default function Profile() {
  const { user, updateProfile, isSubmitting } = useAuth()
  const { projects, tasks } = useAppData()
  const { showToast } = useToast()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [errors, setErrors] = useState({})

  const stats = useMemo(() => {
    const ownedProjects = projects.filter((p) => p.ownerId === user?.id).length
    const myTasks = tasks.filter((t) => t.assigneeId === user?.id)
    const completedTasks = myTasks.filter((t) => t.status === 'COMPLETED').length
    const pendingTasks = myTasks.length - completedTasks
    return { ownedProjects, totalProjects: projects.length, completedTasks, pendingTasks }
  }, [projects, tasks, user?.id])

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSave = async (event) => {
    event.preventDefault()
    if (!validate()) return
    const res = await updateProfile({ name: form.name.trim(), email: form.email.trim() })
    if (res?.ok) {
      setEditing(false)
      showToast({ message: 'Profile updated successfully', type: 'success' })
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          Profile
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          View and manage your account details and productivity summary.
        </p>
      </div>

      {/* User Info Card */}
      <Card className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <UserAvatar user={user} size="lg" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {user?.name || 'User'}
          </h3>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <p className="text-xs text-slate-400">
            Member since {formatDate(user?.createdAt)}
          </p>
        </div>
      </Card>

      {/* Productivity Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Projects Lead
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
            {stats.ownedProjects}
          </p>
          <p className="mt-1 text-xs text-slate-400">of {stats.totalProjects} total workspaces</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Pending Tasks
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.pendingTasks}
          </p>
          <p className="mt-1 text-xs text-slate-400">assigned to you</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tasks Completed
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.completedTasks}
          </p>
          <p className="mt-1 text-xs text-slate-400">finished successfully</p>
        </Card>
      </div>

      {/* Edit Details Card */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Personal Information
          </h3>
          {!editing ? (
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
              Edit profile
            </Button>
          ) : null}
        </div>

        <form onSubmit={onSave} className="space-y-4">
          <Input
            id="profile-name"
            label="Full name"
            required
            disabled={!editing}
            value={form.name}
            error={errors.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            id="profile-email"
            label="Email address"
            type="email"
            required
            disabled={!editing}
            value={form.email}
            error={errors.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          {editing ? (
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(false)
                  setForm({ name: user?.name || '', email: user?.email || '' })
                  setErrors({})
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Save changes
              </Button>
            </div>
          ) : null}
        </form>
      </Card>
    </div>
  )
}
