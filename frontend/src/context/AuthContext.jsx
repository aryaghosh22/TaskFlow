import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../api/auth'
import { updateUserProfile } from '../api/users'

const AuthContext = createContext(null)
const STORAGE_USER = 'taskflow_user'
const STORAGE_TOKEN = 'taskflow_token'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser())
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const persistSession = useCallback((nextUser, token) => {
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(STORAGE_USER)
    }
    if (token) {
      localStorage.setItem(STORAGE_TOKEN, token)
    }
  }, [])

  const clearSession = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_USER)
    localStorage.removeItem(STORAGE_TOKEN)
    localStorage.removeItem('taskflow_projects')
    localStorage.removeItem('taskflow_tasks')
  }, [])

  // Validate session on app launch if token exists
  useEffect(() => {
    let mounted = true
    const verifySession = async () => {
      const token = localStorage.getItem(STORAGE_TOKEN)
      if (!token) {
        if (mounted) setIsCheckingAuth(false)
        return
      }

      try {
        const { data } = await getCurrentUser()
        const resolvedUser = data?.data || data?.user || data
        if (mounted && resolvedUser) {
          persistSession(resolvedUser)
        }
      } catch (err) {
        console.warn('Session expired or invalid, logging out', err)
        if (mounted) clearSession()
      } finally {
        if (mounted) setIsCheckingAuth(false)
      }
    }

    verifySession()
    return () => {
      mounted = false
    }
  }, [persistSession, clearSession])

  const login = useCallback(
    async ({ email, password }) => {
      setError('')
      setIsSubmitting(true)
      try {
        const response = await loginUser({ email, password })
        const resData = response.data
        const token = resData.token || resData.data?.token
        const resolvedUser = resData.user || resData.data?.user || resData.data

        if (!token || !resolvedUser) {
          throw new Error('Authentication response did not contain user credentials')
        }

        persistSession(resolvedUser, token)
        return { ok: true }
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.errors?.email ||
          err.response?.data?.errors?.password ||
          err.message ||
          'Unable to sign in. Please check your credentials.'
        setError(message)
        return { ok: false, error: message }
      } finally {
        setIsSubmitting(false)
      }
    },
    [persistSession],
  )

  const register = useCallback(
    async ({ name, email, password }) => {
      setError('')
      setIsSubmitting(true)
      try {
        const response = await registerUser({ name, email, password })
        const resData = response.data
        const token = resData.token || resData.data?.token
        const resolvedUser = resData.user || resData.data?.user || resData.data

        if (!token || !resolvedUser) {
          throw new Error('Registration response did not contain session credentials')
        }

        persistSession(resolvedUser, token)
        return { ok: true }
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.errors?.email ||
          err.response?.data?.errors?.name ||
          err.response?.data?.errors?.password ||
          err.message ||
          'Unable to create account. Please check your details.'
        setError(message)
        return { ok: false, error: message }
      } finally {
        setIsSubmitting(false)
      }
    },
    [persistSession],
  )

  const logout = useCallback(async () => {
    try {
      await logoutUser().catch(() => {})
    } finally {
      clearSession()
    }
  }, [clearSession])

  const updateProfile = useCallback(
    async ({ name, email }) => {
      setIsSubmitting(true)
      try {
        const response = await updateUserProfile({ name, email })
        const updated = response.data?.user || response.data?.data || response.data
        persistSession(updated)
        return { ok: true, user: updated }
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.errors?.email ||
          err.response?.data?.errors?.name ||
          err.message ||
          'Failed to update profile'
        return { ok: false, error: message }
      } finally {
        setIsSubmitting(false)
      }
    },
    [persistSession],
  )

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isCheckingAuth,
      error,
      setError,
      isSubmitting,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, isCheckingAuth, error, isSubmitting, login, register, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
