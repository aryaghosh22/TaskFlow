import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ListTodo, Plus, Search, FilterX } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAppData } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import EmptyState from '../components/ui/EmptyState'
import TaskTable from '../components/TaskTable'
import TaskFormModal from '../components/TaskFormModal'
import TaskDetailsModal from '../components/TaskDetailsModal'
import ConfirmModal from '../components/ui/ConfirmModal'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  PRIORITY_LABELS,
} from '../data/constants'
import { isOverdue } from '../utils/format'

export default function Tasks() {
  const { user } = useAuth()
  const {
    projects,
    tasks,
    users,
    createTask,
    updateTask,
    deleteTask,
    isMutating,
  } = useAppData()
  const { showToast } = useToast()

  const [params, setParams] = useSearchParams()
  const [quickTab, setQuickTab] = useState('ALL') // 'ALL' | 'MY_TASKS' | 'DUE_SOON' | 'HIGH_PRIORITY'
  const [query, setQuery] = useState(params.get('q') || '')
  const [status, setStatus] = useState('ALL')
  const [priority, setPriority] = useState('ALL')
  const [projectId, setProjectId] = useState('ALL')
  const [assigneeId, setAssigneeId] = useState('ALL')
  const [due, setDue] = useState('')
  const [sort, setSort] = useState('updated')

  // Modals state
  const [formModal, setFormModal] = useState({ open: false, task: null })
  const [detailsTask, setDetailsTask] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)

  const userById = useMemo(
    () => Object.fromEntries(users.map((item) => [item.id, item])),
    [users],
  )
  const projectById = useMemo(
    () => Object.fromEntries(projects.map((item) => [item.id, item])),
    [projects],
  )

  const handleQueryChange = (val) => {
    setQuery(val)
    if (val.trim()) {
      setParams({ q: val.trim() }, { replace: true })
    } else {
      setParams({}, { replace: true })
    }
  }

  const resetFilters = () => {
    setQuery('')
    setStatus('ALL')
    setPriority('ALL')
    setProjectId('ALL')
    setAssigneeId('ALL')
    setDue('')
    setQuickTab('ALL')
    setParams({}, { replace: true })
  }

  const isFiltered =
    query ||
    status !== 'ALL' ||
    priority !== 'ALL' ||
    projectId !== 'ALL' ||
    assigneeId !== 'ALL' ||
    due !== '' ||
    quickTab !== 'ALL'

  const filtered = useMemo(() => {
    let list = tasks.filter((task) => {
      // Quick tabs
      if (quickTab === 'MY_TASKS' && task.assigneeId !== user?.id) return false
      if (quickTab === 'DUE_SOON') {
        if (!task.dueDate || task.status === 'COMPLETED') return false
        const now = new Date()
        const target = new Date(task.dueDate)
        const diffDays = (target - now) / (1000 * 60 * 60 * 24)
        if (diffDays > 7 && !isOverdue(task.dueDate, task.status)) return false
      }
      if (quickTab === 'HIGH_PRIORITY' && task.priority !== 'HIGH' && task.priority !== 'URGENT') {
        return false
      }

      // Detailed filters
      const q = query.toLowerCase()
      const matchesQuery =
        !query ||
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        (task.labels && task.labels.some((l) => l.toLowerCase().includes(q)))

      const matchesStatus = status === 'ALL' || task.status === status
      const matchesPriority = priority === 'ALL' || task.priority === priority
      const matchesProject = projectId === 'ALL' || task.projectId === projectId
      const matchesAssignee =
        assigneeId === 'ALL' ||
        (assigneeId === 'UNASSIGNED' ? !task.assigneeId : task.assigneeId === assigneeId)
      const matchesDue = !due || (task.dueDate && task.dueDate.slice(0, 10) === due)

      return (
        matchesQuery &&
        matchesStatus &&
        matchesPriority &&
        matchesProject &&
        matchesAssignee &&
        matchesDue
      )
    })

    list = [...list].sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title)
      if (sort === 'due') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      if (sort === 'priority') {
        const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
        return (order[a.priority] ?? 99) - (order[b.priority] ?? 99)
      }
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })

    return list
  }, [tasks, quickTab, query, status, priority, projectId, assigneeId, due, sort, user?.id])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Tasks
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track, prioritize, and manage tasks across all projects.
          </p>
        </div>
        <Button onClick={() => setFormModal({ open: true, task: null })}>
          <Plus className="h-4 w-4" /> New task
        </Button>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setQuickTab('ALL')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            quickTab === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          All tasks ({tasks.length})
        </button>
        <button
          type="button"
          onClick={() => setQuickTab('MY_TASKS')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            quickTab === 'MY_TASKS'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Assigned to me ({tasks.filter((t) => t.assigneeId === user?.id).length})
        </button>
        <button
          type="button"
          onClick={() => setQuickTab('DUE_SOON')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            quickTab === 'DUE_SOON'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Due soon / Overdue
        </button>
        <button
          type="button"
          onClick={() => setQuickTab('HIGH_PRIORITY')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            quickTab === 'HIGH_PRIORITY'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          High & Urgent ({tasks.filter((t) => t.priority === 'HIGH' || t.priority === 'URGENT').length})
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 items-end">
        <div className="sm:col-span-2 relative">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1.5">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="task-search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by title, description, or #tag..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <Select
          id="filter-status"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          {TASK_STATUSES.map((item) => (
            <option key={item} value={item}>
              {TASK_STATUS_LABELS[item]}
            </option>
          ))}
        </Select>

        <Select
          id="filter-priority"
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="ALL">All priorities</option>
          {TASK_PRIORITIES.map((item) => (
            <option key={item} value={item}>
              {PRIORITY_LABELS[item]}
            </option>
          ))}
        </Select>

        <Select
          id="filter-project"
          label="Project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          <option value="ALL">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>

        <Select
          id="filter-assignee"
          label="Assignee"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="ALL">All assignees</option>
          <option value="UNASSIGNED">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>

        <div>
          <label
            htmlFor="filter-due"
            className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1.5"
          >
            Due date
          </label>
          <input
            id="filter-due"
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <Select
          id="filter-sort"
          label="Sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="updated">Last updated</option>
          <option value="due">Due date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </Select>

        {isFiltered ? (
          <div className="sm:col-span-2 lg:col-span-2 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-slate-500 hover:text-slate-700"
            >
              <FilterX className="h-4 w-4" /> Clear all filters
            </Button>
          </div>
        ) : null}
      </div>

      {/* Task List / Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks match the active filters"
          description="Try broadening your search or filter parameters, or create a new task."
          action={
            <Button onClick={() => setFormModal({ open: true, task: null })}>
              <Plus className="h-4 w-4" /> New task
            </Button>
          }
        />
      ) : (
        <TaskTable
          tasks={filtered}
          projectById={projectById}
          userById={userById}
          onOpen={setDetailsTask}
          onEdit={(task) => setFormModal({ open: true, task })}
          onDelete={(task) => setTaskToDelete(task)}
          onStatusChange={async (id, nextStatus) => {
            await updateTask(id, { status: nextStatus })
            showToast({
              message: `Status updated to ${TASK_STATUS_LABELS[nextStatus]}`,
              type: 'success',
            })
          }}
        />
      )}

      {/* Create / Edit Task Modal */}
      <TaskFormModal
        open={formModal.open}
        task={formModal.task}
        projects={projects}
        users={users}
        loading={isMutating}
        onClose={() => setFormModal({ open: false, task: null })}
        onSubmit={async (payload) => {
          if (formModal.task) {
            const res = await updateTask(formModal.task.id, payload)
            if (res?.ok) showToast({ message: 'Task updated', type: 'success' })
            return res
          } else {
            const res = await createTask(payload)
            if (res?.ok) showToast({ message: 'Task created', type: 'success' })
            return res
          }
        }}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        open={Boolean(detailsTask)}
        task={detailsTask}
        project={projectById[detailsTask?.projectId]}
        assignee={userById[detailsTask?.assigneeId]}
        users={users}
        onClose={() => setDetailsTask(null)}
        onEdit={(task) => {
          setDetailsTask(null)
          setFormModal({ open: true, task })
        }}
        onDelete={(task) => {
          setDetailsTask(null)
          setTaskToDelete(task)
        }}
        onChangeStatus={async (id, next) => {
          await updateTask(id, { status: next })
          setDetailsTask((prev) => (prev ? { ...prev, status: next } : prev))
          showToast({
            message: `Moved to ${TASK_STATUS_LABELS[next]}`,
            type: 'success',
          })
        }}
        onChangePriority={async (id, next) => {
          await updateTask(id, { priority: next })
          setDetailsTask((prev) => (prev ? { ...prev, priority: next } : prev))
          showToast({
            message: `Priority updated to ${PRIORITY_LABELS[next]}`,
            type: 'info',
          })
        }}
        onAssign={async (id, next) => {
          await updateTask(id, { assigneeId: next })
          setDetailsTask((prev) => (prev ? { ...prev, assigneeId: next } : prev))
          showToast({ message: 'Assignee updated', type: 'info' })
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={async () => {
          if (taskToDelete) {
            await deleteTask(taskToDelete.id)
            showToast({ message: 'Task deleted', type: 'info' })
            setTaskToDelete(null)
          }
        }}
        title="Delete task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This cannot be undone.`}
      />
    </div>
  )
}
