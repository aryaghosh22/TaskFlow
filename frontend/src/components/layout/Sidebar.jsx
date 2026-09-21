import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  User,
  Settings,
  LogOut,
  X,
  Hash,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppContext'
import Logo from '../ui/Logo'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
]

const BOTTOM = [
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function NavItem({ to, label, icon: Icon, badge, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-indigo-950/50 dark:text-indigo-300'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
        }`
      }
    >
      <span className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </span>
      {badge !== undefined ? (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {badge}
        </span>
      ) : null}
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth()
  const { projects, tasks } = useAppData()

  const pendingTasksCount = tasks.filter((t) => t.status !== 'COMPLETED').length
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').slice(0, 4)

  const content = (
    <div className="flex h-full flex-col">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
        <Logo size="sm" subtitle="Workspace" />
        <button
          type="button"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden dark:hover:bg-slate-800"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        <nav className="space-y-1">
          {LINKS.map((link) => {
            const badge = link.to === '/tasks' ? pendingTasksCount : undefined
            return <NavItem key={link.to} {...link} badge={badge} onClick={onClose} />
          })}
        </nav>

        {/* Quick Project Shortcuts (Linear style) */}
        {activeProjects.length > 0 ? (
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Active Projects
            </p>
            <div className="space-y-0.5">
              {activeProjects.map((p) => (
                <NavLink
                  key={p.id}
                  to={`/projects/${p.id}`}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium truncate transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Hash className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{p.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom Profile/Settings */}
      <div className="space-y-1 border-t border-slate-200 p-3 dark:border-slate-800">
        {BOTTOM.map((link) => (
          <NavItem key={link.to} {...link} onClick={onClose} />
        ))}
        <button
          type="button"
          onClick={() => {
            onClose?.()
            logout()
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-red-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900 transition-colors">
        {content}
      </aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            aria-label="Close navigation overlay"
            onClick={onClose}
          />
          <aside className="relative z-10 h-full w-64 bg-white shadow-xl dark:bg-slate-900">{content}</aside>
        </div>
      ) : null}
    </>
  )
}
