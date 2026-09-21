import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAppData } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import { RotateCcw } from 'lucide-react'

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start justify-between gap-4 py-3 cursor-pointer">
      <span>
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
        <span className="block text-xs text-slate-500 mt-0.5">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-xs transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { resetData } = useAppData()
  const { showToast } = useToast()

  const [notifications, setNotifications] = useState({
    assignment: true,
    deadlines: true,
    updates: false,
  })

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [passwordError, setPasswordError] = useState('')

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (!passwordForm.current) {
      setPasswordError('Please enter your current password.')
      return
    }
    if (passwordForm.next.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError('Passwords do not match.')
      return
    }

    setPasswordError('')
    setPasswordOpen(false)
    setPasswordForm({ current: '', next: '', confirm: '' })
    showToast({ message: 'Password updated successfully', type: 'success' })
  }

  const handleResetData = () => {
    resetData()
    setResetConfirmOpen(false)
    showToast({ message: 'Workspace demo data restored to initial state', type: 'success' })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage system appearance, notifications, and demo workspace storage.
        </p>
      </div>

      {/* Theme Appearance */}
      <Card>
        <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-50">Appearance</h3>
        <p className="mb-4 text-xs text-slate-500">
          Choose between light and dark themes. Preferences persist automatically.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`rounded-xl border p-4 text-left transition-all ${
              theme === 'light'
                ? 'border-brand-600 bg-brand-50/50 dark:bg-indigo-950/40 ring-1 ring-brand-600'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Light mode</span>
            <span className="mt-1 block text-xs text-slate-500">
              Clean white backgrounds and sharp high-contrast slate text.
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`rounded-xl border p-4 text-left transition-all ${
              theme === 'dark'
                ? 'border-brand-600 bg-brand-50/50 dark:bg-indigo-950/40 ring-1 ring-brand-600'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Dark mode</span>
            <span className="mt-1 block text-xs text-slate-500">
              Muted dark slate surfaces optimized for low-light work.
            </span>
          </button>
        </div>
      </Card>

      {/* Notifications Preferences */}
      <Card>
        <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-50">Notifications</h3>
        <p className="mb-2 text-xs text-slate-500">
          Control which events trigger system alerts.
        </p>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <Toggle
            checked={notifications.assignment}
            onChange={(value) => {
              setNotifications((prev) => ({ ...prev, assignment: value }))
              showToast({ message: `Assignment notifications ${value ? 'enabled' : 'disabled'}` })
            }}
            label="Task assignments"
            description="Notify me when a new task is assigned to my queue."
          />
          <Toggle
            checked={notifications.deadlines}
            onChange={(value) => {
              setNotifications((prev) => ({ ...prev, deadlines: value }))
              showToast({ message: `Deadline reminders ${value ? 'enabled' : 'disabled'}` })
            }}
            label="Deadline reminders"
            description="Alert me 24 hours prior to upcoming task due dates."
          />
          <Toggle
            checked={notifications.updates}
            onChange={(value) => {
              setNotifications((prev) => ({ ...prev, updates: value }))
              showToast({ message: `Project digests ${value ? 'enabled' : 'disabled'}` })
            }}
            label="Project digests"
            description="Weekly summary of completed tasks and overall project health."
          />
        </div>
      </Card>

      {/* Demo Workspace Data Management */}
      <Card>
        <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
          Demo Workspace Data
        </h3>
        <p className="mb-4 text-xs text-slate-500 leading-relaxed">
          TaskFlow stores your created tasks and projects in local browser storage so you can test full CRUD operations across refreshes. If you wish to reset all data back to the default seed dataset, click below.
        </p>
        <Button variant="secondary" onClick={() => setResetConfirmOpen(true)}>
          <RotateCcw className="h-4 w-4" /> Reset demo data
        </Button>
      </Card>

      {/* Security & Account */}
      <Card>
        <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-50">Security</h3>
        <p className="mb-4 text-xs text-slate-500">
          Manage your password and authentication credentials.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setPasswordOpen(true)}>
            Change password
          </Button>
          <Button variant="danger" onClick={() => setDeleteAccountOpen(true)}>
            Delete account
          </Button>
        </div>
      </Card>

      {/* Change Password Modal */}
      <Modal
        open={passwordOpen}
        onClose={() => {
          setPasswordOpen(false)
          setPasswordError('')
        }}
        title="Change password"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPasswordOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="change-pw-form">
              Save password
            </Button>
          </>
        }
      >
        <form id="change-pw-form" onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordError ? (
            <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {passwordError}
            </div>
          ) : null}
          <Input
            id="current-password"
            label="Current password"
            type="password"
            required
            value={passwordForm.current}
            onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
          />
          <Input
            id="new-password"
            label="New password"
            type="password"
            required
            value={passwordForm.next}
            onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
            hint="Minimum 8 characters"
          />
          <Input
            id="confirm-password"
            label="Confirm new password"
            type="password"
            required
            value={passwordForm.confirm}
            onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
          />
        </form>
      </Modal>

      {/* Reset Data Confirmation */}
      <ConfirmModal
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="Reset demo data"
        message="Are you sure you want to restore the default sample projects and tasks? Any custom items you created will be reset."
        confirmLabel="Reset data"
        confirmVariant="primary"
      />

      {/* Delete Account Modal */}
      <ConfirmModal
        open={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        onConfirm={() => {
          setDeleteAccountOpen(false)
          showToast({ message: 'Account deletion simulated for demo', type: 'info' })
        }}
        title="Delete account"
        message="This is a client-side demo. In production with the backend connected, this action will remove all user records and database sessions."
        confirmLabel="Simulate delete"
      />
    </div>
  )
}
