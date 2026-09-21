import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorMessage from '../components/ui/ErrorMessage'
import Logo from '../components/ui/Logo'

const REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { id: 'letter', label: 'Contains a letter', test: (value) => /[A-Za-z]/.test(value) },
  { id: 'number', label: 'Contains a number', test: (value) => /\d/.test(value) },
]

export default function Register() {
  const { register, isAuthenticated, isSubmitting, error, setError } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})

  const checks = useMemo(
    () => REQUIREMENTS.map((rule) => ({ ...rule, ok: rule.test(form.password) })),
    [form.password],
  )

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Full name is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email.'
    if (checks.some((rule) => !rule.ok)) next.password = 'Password does not meet requirements.'
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!validate()) return
    await register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Logo size="lg" subtitle="Create your workspace" className="mb-6" />
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Create account</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">Start organizing projects and tasks.</p>
        <ErrorMessage message={error} className="mb-4" />
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            id="reg-name"
            label="Full name"
            required
            value={form.name}
            error={errors.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Arya Sharma"
          />
          <Input
            id="reg-email"
            label="Email"
            type="email"
            required
            value={form.email}
            error={errors.email}
            onChange={(event) => update('email', event.target.value)}
            placeholder="you@company.com"
          />
          <Input
            id="reg-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            value={form.password}
            error={errors.password}
            onChange={(event) => update('password', event.target.value)}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="rounded p-1 text-slate-400"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <ul className="space-y-1 text-xs">
            {checks.map((rule) => (
              <li key={rule.id} className={rule.ok ? 'text-emerald-700' : 'text-slate-500'}>
                {rule.ok ? '✓' : '•'} {rule.label}
              </li>
            ))}
          </ul>
          <Input
            id="reg-confirm"
            label="Confirm password"
            type={showConfirm ? 'text' : 'password'}
            required
            value={form.confirm}
            error={errors.confirm}
            onChange={(event) => update('confirm', event.target.value)}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                className="rounded p-1 text-slate-400"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <Button type="submit" className="w-full" loading={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
