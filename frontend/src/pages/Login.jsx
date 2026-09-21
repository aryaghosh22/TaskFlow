import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorMessage from '../components/ui/ErrorMessage'
import Logo from '../components/ui/Logo'

export default function Login() {
  const { login, isAuthenticated, isSubmitting, error, setError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const fillDemo = () => {
    setEmail('arya.ghosh@taskflow.app')
    setPassword('password123')
    setErrors({})
    setError('')
  }

  const validate = () => {
    const next = {}
    if (!email.trim()) next.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email.'
    if (!password) next.password = 'Password is required.'
    else if (password.length < 8) next.password = 'Password must be at least 8 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!validate()) return
    await login({ email, password })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {/* Brand Logo & Name */}
        <Logo size="lg" subtitle="Project & task management workspace" className="mb-6" />

        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 mb-5 text-sm text-slate-500">
          Enter your credentials to access your dashboard.
        </p>

        {/* Demo Fast-Fill Banner */}
        <div className="mb-5 rounded-lg border border-indigo-100 bg-indigo-50/70 p-3 dark:border-indigo-900/60 dark:bg-indigo-950/30 flex items-center justify-between">
          <div className="text-xs text-indigo-900 dark:text-indigo-200">
            <span className="font-semibold block">Demo credentials ready</span>
            <span className="text-[11px] text-indigo-700 dark:text-indigo-300">arya.ghosh@taskflow.app</span>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-2xs hover:bg-slate-50 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700 transition-colors"
          >
            <Sparkles className="h-3 w-3" /> Quick fill
          </button>
        </div>

        <ErrorMessage message={error} className="mb-4" />

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            id="login-email"
            label="Work email"
            type="email"
            autoComplete="email"
            required
            value={email}
            error={errors.email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
          />

          <Input
            id="login-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            error={errors.password}
            onChange={(event) => setPassword(event.target.value)}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>Remember this device</span>
            </label>
            <span className="text-slate-400">REST API ready</span>
          </div>

          <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in to TaskFlow'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
