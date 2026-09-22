import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  getProjects as fetchProjectsApi,
  createProject as createProjectApi,
  updateProject as updateProjectApi,
  deleteProject as deleteProjectApi,
} from '../api/projects'
import {
  getTasks as fetchTasksApi,
  createTask as createTaskApi,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
} from '../api/tasks'
import { getUsers as fetchUsersApi } from '../api/users'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)
const STORAGE_PROJECTS = 'taskflow_projects'
const STORAGE_TASKS = 'taskflow_tasks'

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function AppProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [projects, setProjects] = useState(() => readStorage(STORAGE_PROJECTS, []))
  const [tasks, setTasks] = useState(() => readStorage(STORAGE_TASKS, []))
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMutating, setIsMutating] = useState(false)

  // Synchronize state with localStorage as backup cache
  const saveProjects = useCallback((updater) => {
    setProjects((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      try {
        localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(next))
      } catch (err) {
        console.error('Failed to cache projects', err)
      }
      return next
    })
  }, [])

  const saveTasks = useCallback((updater) => {
    setTasks((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      try {
        localStorage.setItem(STORAGE_TASKS, JSON.stringify(next))
      } catch (err) {
        console.error('Failed to cache tasks', err)
      }
      return next
    })
  }, [])

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const [projRes, taskRes, usersRes] = await Promise.allSettled([
        fetchProjectsApi(),
        fetchTasksApi({ limit: 100 }),
        fetchUsersApi(),
      ])

      if (projRes.status === 'fulfilled' && projRes.value?.data) {
        const list = projRes.value.data.data || projRes.value.data
        if (Array.isArray(list)) saveProjects(list)
      }

      if (taskRes.status === 'fulfilled' && taskRes.value?.data) {
        const list = taskRes.value.data.data || taskRes.value.data
        if (Array.isArray(list)) saveTasks(list)
      }

      if (usersRes.status === 'fulfilled' && usersRes.value?.data) {
        const list = usersRes.value.data.data || usersRes.value.data
        if (Array.isArray(list)) setUsers(list)
      }
    } catch (err) {
      console.warn('Backend synchronization warning, using local cache:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, saveProjects, saveTasks])

  // Initial load when user authentication is confirmed
  useEffect(() => {
    if (!isAuthenticated) {
      setProjects([])
      setTasks([])
      setUsers([])
      return
    }

    let ignore = false
    const sync = async () => {
      try {
        const [projRes, taskRes, usersRes] = await Promise.allSettled([
          fetchProjectsApi(),
          fetchTasksApi({ limit: 100 }),
          fetchUsersApi(),
        ])

        if (ignore) return

        if (projRes.status === 'fulfilled' && projRes.value?.data) {
          const list = projRes.value.data.data || projRes.value.data
          if (Array.isArray(list)) saveProjects(list)
        }

        if (taskRes.status === 'fulfilled' && taskRes.value?.data) {
          const list = taskRes.value.data.data || taskRes.value.data
          if (Array.isArray(list)) saveTasks(list)
        }

        if (usersRes.status === 'fulfilled' && usersRes.value?.data) {
          const list = usersRes.value.data.data || usersRes.value.data
          if (Array.isArray(list)) setUsers(list)
        }
      } catch (err) {
        console.warn('Backend initial synchronization using local cache:', err)
      }
    }

    sync()
    return () => {
      ignore = true
    }
  }, [isAuthenticated, user?.id, saveProjects, saveTasks])

  const createProject = useCallback(
    async (payload) => {
      setIsMutating(true)
      try {
        const response = await createProjectApi(payload)
        const project = response.data.data || response.data
        saveProjects((prev) => [project, ...prev.filter((p) => p.id !== project.id)])
        return { ok: true, project }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Failed to create project'
        return { ok: false, error: message }
      } finally {
        setIsMutating(false)
      }
    },
    [saveProjects],
  )

  const updateProject = useCallback(
    async (projectId, payload) => {
      setIsMutating(true)
      try {
        const response = await updateProjectApi(projectId, payload)
        const updatedProject = response.data.data || response.data
        saveProjects((prev) =>
          prev.map((project) => (project.id === projectId ? { ...project, ...updatedProject } : project)),
        )
        return { ok: true, project: updatedProject }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Failed to update project'
        return { ok: false, error: message }
      } finally {
        setIsMutating(false)
      }
    },
    [saveProjects],
  )

  const deleteProject = useCallback(
    async (projectId) => {
      setIsMutating(true)
      try {
        await deleteProjectApi(projectId)
        saveProjects((prev) => prev.filter((project) => project.id !== projectId))
        saveTasks((prev) => prev.filter((task) => task.projectId !== projectId))
        return { ok: true }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Failed to delete project'
        return { ok: false, error: message }
      } finally {
        setIsMutating(false)
      }
    },
    [saveProjects, saveTasks],
  )

  const createTask = useCallback(
    async (payload) => {
      setIsMutating(true)
      try {
        const response = await createTaskApi(payload)
        const task = response.data.data || response.data
        saveTasks((prev) => [task, ...prev.filter((t) => t.id !== task.id)])
        saveProjects((prev) =>
          prev.map((project) =>
            project.id === payload.projectId
              ? { ...project, updatedAt: task.updatedAt || new Date().toISOString() }
              : project,
          ),
        )
        return { ok: true, task }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Failed to create task'
        return { ok: false, error: message }
      } finally {
        setIsMutating(false)
      }
    },
    [saveTasks, saveProjects],
  )

  const updateTask = useCallback(
    async (taskId, payload) => {
      setIsMutating(true)
      try {
        const response = await updateTaskApi(taskId, payload)
        const updatedTask = response.data.data || response.data
        saveTasks((prev) =>
          prev.map((task) => (task.id === taskId ? { ...task, ...updatedTask } : task)),
        )
        if (updatedTask.projectId) {
          saveProjects((prev) =>
            prev.map((project) =>
              project.id === updatedTask.projectId
                ? { ...project, updatedAt: updatedTask.updatedAt || new Date().toISOString() }
                : project,
            ),
          )
        }
        return { ok: true, task: updatedTask }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Failed to update task'
        return { ok: false, error: message }
      } finally {
        setIsMutating(false)
      }
    },
    [saveTasks, saveProjects],
  )

  const deleteTask = useCallback(
    async (taskId) => {
      setIsMutating(true)
      try {
        await deleteTaskApi(taskId)
        saveTasks((prev) => prev.filter((task) => task.id !== taskId))
        return { ok: true }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Failed to delete task'
        return { ok: false, error: message }
      } finally {
        setIsMutating(false)
      }
    },
    [saveTasks],
  )

  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_PROJECTS)
    localStorage.removeItem(STORAGE_TASKS)
    setProjects([])
    setTasks([])
    refreshData()
  }, [refreshData])

  const value = useMemo(
    () => ({
      users,
      projects,
      tasks,
      isLoading,
      isMutating,
      refreshData,
      createProject,
      updateProject,
      deleteProject,
      createTask,
      updateTask,
      deleteTask,
      resetData,
    }),
    [
      users,
      projects,
      tasks,
      isLoading,
      isMutating,
      refreshData,
      createProject,
      updateProject,
      deleteProject,
      createTask,
      updateTask,
      deleteTask,
      resetData,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppData() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppData must be used within AppProvider')
  }
  return context
}
