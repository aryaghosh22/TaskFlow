import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu, Search, Settings, User, Sun, Moon, CheckCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { PAGE_TITLES } from '../../data/constants'
import { NOTIFICATIONS } from '../../data/seed'
import { formatDate } from '../../utils/format'
import UserAvatar from '../UserAvatar'
import Dropdown, { DropdownItem } from '../ui/Dropdown'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const [notifOpen, setNotifOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const title =
    PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/projects/') ? 'Project Details' : 'TaskFlow')

  const onSearch = (event) => {
    event.preventDefault()
    navigate(query.trim() ? `/tasks?q=${encodeURIComponent(query.trim())}` : '/tasks')
  }

  return (
    <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 transition-colors">
      {/* Mobile Menu Button */}
      <button
        type="button"
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
        onClick={onMenuClick}
        aria-label="Open mobile navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page Title */}
      <h1 className="min-w-0 truncate text-base font-bold text-slate-900 dark:text-slate-50 tracking-tight">
        {title}
      </h1>

      {/* Global Search Bar */}
      <form onSubmit={onSearch} className="ml-auto min-w-0 max-w-sm flex-1 hidden sm:block">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks across workspace..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-900 transition-colors"
          />
        </label>
      </form>

      {/* Theme Toggle (Instant Header Switch) */}
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors ml-auto sm:ml-0"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Notification Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setNotifOpen((v) => !v)}
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
            </span>
          ) : null}
        </button>

        {notifOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-30 cursor-default"
              onClick={() => setNotifOpen(false)}
              aria-label="Close notifications menu"
            />
            <div className="absolute right-0 z-40 mt-1 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Notifications
                  </span>
                  {unreadCount > 0 ? (
                    <span className="rounded-full bg-brand-50 px-1.5 py-0.2 text-[10px] font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {unreadCount} new
                    </span>
                  ) : null}
                </div>
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-brand-600 dark:hover:text-brand-400"
                  >
                    <CheckCheck className="h-3 w-3" /> Mark all read
                  </button>
                ) : null}
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setNotifOpen(false)
                      navigate(n.link)
                    }}
                    className={`p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg cursor-pointer transition-colors ${
                      !n.read ? 'bg-slate-50/80 dark:bg-slate-800/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* User Dropdown */}
      <Dropdown
        trigger={
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <UserAvatar user={user} size="sm" />
            <span className="hidden text-xs font-semibold text-slate-700 sm:inline dark:text-slate-200">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </button>
        }
      >
        <div className="border-b border-slate-100 px-3 py-2 text-xs dark:border-slate-800">
          <p className="font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
          <p className="truncate text-slate-400 text-[11px]">{user?.email}</p>
        </div>
        <DropdownItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-3.5 w-3.5 text-slate-400" /> Profile overview
        </DropdownItem>
        <DropdownItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-3.5 w-3.5 text-slate-400" /> Settings & Data
        </DropdownItem>
        <DropdownItem danger onClick={logout}>
          <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
        </DropdownItem>
      </Dropdown>
    </header>
  )
}
