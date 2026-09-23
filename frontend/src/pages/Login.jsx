import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorMessage from '../components/ui/ErrorMessage'
import Logo from '../components/ui/Logo'
import InteractiveMeshBackground from '../components/ui/InteractiveMeshBackground'

export default function Login() {
  const { login, isAuthenticated, isSubmitting, error, setError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

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
    <InteractiveMeshBackground>
      {/* Glassmorphic Card Container */}
      <div className="w-full max-w-md rounded-2xl border border-slate-800/80 bg-slate-900/80 p-8 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl ring-1 ring-white/10">
        {/* Brand Logo & Name */}
        <Logo size="lg" subtitle="Project & task management workspace" className="mb-6" />

        <h1 className="text-xl font-bold text-slate-100 tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 mb-5 text-sm text-slate-400">
          Enter your credentials to access your dashboard.
        </p>

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
                className="rounded p-1 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 transition-colors">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-700 bg-slate-800 text-brand-600 focus:ring-brand-500"
              />
              <span>Remember this device</span>
            </label>
          </div>

          <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in to TaskFlow'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-brand-400 hover:text-brand-300 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </InteractiveMeshBackground>
  )
}
