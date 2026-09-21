import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Edit2,
  Trash2,
  Search,
} from 'lucide-react'
import { useAppData } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import ProgressBar from '../components/ui/ProgressBar'
import ProjectStatusBadge from '../components/ProjectStatusBadge'
import UserAvatar from '../components/UserAvatar'
import TaskCard from '../components/TaskCard'
import TaskTable from '../components/TaskTable'
import TaskFormModal from '../components/TaskFormModal'
import TaskDetailsModal from '../components/TaskDetailsModal'
import ProjectFormModal from '../components/ProjectFormModal'
import ConfirmModal from '../components/ui/ConfirmModal'
import { TASK_STATUSES, TASK_STATUS_LABELS, TASK_PRIORITIES, PRIORITY_LABELS } from '../data/constants'
import { formatDate, isOverdue } from '../utils/format'

const COLUMN_BORDER_COLORS = {
  TODO: 'border-t-slate-400',
  IN_PROGRESS: 'border-t-blue-500',
  REVIEW: 'border-t-amber-500',
  COMPLETED: 'border-t-emerald-500',
}

export default function ProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const {
    projects,
    tasks,
    users,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    isMutating,
  } = useAppData()
  const { showToast } = useToast()

  const project = projects.find((item) => item.id === projectId)

  // Local view and filter states
  const [viewMode, setViewMode] = useState('board') // 'board' | 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [assigneeFilter, setAssigneeFilter] = useState('ALL')
  const [dragOverColumn, setDragOverColumn] = useState(null)

  // Modals
  const [taskModal, setTaskModal] = useState({ open: false, task: null, status: 'TODO' })
  const [detailsTask, setDetailsTask] = useState(null)
  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)

  const userById = useMemo(
    () => Object.fromEntries(users.map((item) => [item.id, item])),
    [users],
  )
  const projectById = useMemo(
    () => Object.fromEntries(projects.map((item) => [item.id, item])),
    [projects],
  )

  const rawProjectTasks = useMemo(
    () => tasks.filter((task) => task.projectId === projectId),
    [tasks, projectId],
  )

  // Filtered tasks for the board/list
  const projectTasks = useMemo(() => {
    return rawProjectTasks.filter((task) => {
      const matchQuery = !searchQuery || task.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchPriority = priorityFilter === 'ALL' || task.priority === priorityFilter
      const matchAssignee =
        assigneeFilter === 'ALL' ||
        (assigneeFilter === 'UNASSIGNED' ? !task.assigneeId : task.assigneeId === assigneeFilter)
      return matchQuery && matchPriority && matchAssignee
    })
  }, [rawProjectTasks, searchQuery, priorityFilter, assigneeFilter])

  const stats = useMemo(() => {
    const total = rawProjectTasks.length
    const completed = rawProjectTasks.filter((task) => task.status === 'COMPLETED').length
    const inProgress = rawProjectTasks.filter((task) => task.status === 'IN_PROGRESS').length
    const overdue = rawProjectTasks.filter((task) => isOverdue(task.dueDate, task.status)).length
    const percent = total ? Math.round((completed / total) * 100) : 0
    return { total, completed, inProgress, overdue, percent }
  }, [rawProjectTasks])

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="This project may have been deleted or moved."
        action={
          <Button variant="secondary" onClick={() => navigate('/projects')}>
            Back to projects
          </Button>
        }
      />
    )
  }

  const owner = userById[project.ownerId]

  // Drag and Drop handlers for Kanban
  const handleDragOver = (e, status) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverColumn !== status) {
      setDragOverColumn(status)
    }
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    const taskId = e.dataTransfer.getData('text/plain')
    if (!taskId) return

    const droppedTask = rawProjectTasks.find((t) => t.id === taskId)
    if (!droppedTask || droppedTask.status === targetStatus) return

    const result = await updateTask(taskId, { status: targetStatus })
    if (result?.ok) {
      showToast({
        message: `Task moved to ${TASK_STATUS_LABELS[targetStatus]}`,
        type: 'success',
      })
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditProjectOpen(true)}>
            <Edit2 className="h-3.5 w-3.5" /> Edit project
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteProjectOpen(true)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
          <Button size="sm" onClick={() => setTaskModal({ open: true, task: null, status: 'TODO' })}>
            <Plus className="h-4 w-4" /> New task
          </Button>
        </div>
      </div>

      {/* Project Header Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                {project.name}
              </h2>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {project.description || 'No project description provided.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 shrink-0">
            <div className="flex items-center gap-2">
              <UserAvatar user={owner} size="sm" />
              <div>
                <span className="block text-[11px] text-slate-400">Lead</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {owner?.name || 'Unassigned'}
                </span>
              </div>
            </div>
            {project.deadline ? (
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 dark:bg-slate-800">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <span className="block text-[11px] text-slate-400">Deadline</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {formatDate(project.deadline)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Project Stats Summary */}
        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <span className="text-xs text-slate-400">Completion</span>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">{stats.percent}%</p>
            <ProgressBar value={stats.percent} className="mt-1" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Tasks In Progress</span>
            <p className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
            <p className="text-xs text-slate-500">out of {stats.total} total</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Completed Tasks</span>
            <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
            <p className="text-xs text-slate-500">{stats.total - stats.completed} remaining</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Overdue Tasks</span>
            <p className={`mt-1 text-xl font-bold ${stats.overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {stats.overdue}
            </p>
            <p className="text-xs text-slate-500">past target deadline</p>
          </div>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-2xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in project..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">All priorities</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">All assignees</option>
            <option value="UNASSIGNED">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-1 self-end sm:self-auto rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              viewMode === 'board'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Board
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <List className="h-3.5 w-3.5" /> List
          </button>
        </div>
      </div>

      {/* Main View: Board or List */}
      {viewMode === 'board' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 items-start">
          {TASK_STATUSES.map((colStatus) => {
            const columnTasks = projectTasks.filter((t) => t.status === colStatus)
            const isTarget = dragOverColumn === colStatus

            return (
              <section
                key={colStatus}
                onDragOver={(e) => handleDragOver(e, colStatus)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, colStatus)}
                className={`flex flex-col rounded-xl border border-t-4 bg-slate-50/70 p-3 transition-colors dark:bg-slate-900/40 min-h-[360px] ${
                  COLUMN_BORDER_COLORS[colStatus]
                } ${
                  isTarget
                    ? 'border-brand-500 bg-brand-50/30 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Column Header */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      {TASK_STATUS_LABELS[colStatus]}
                    </h3>
                    <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setTaskModal({ open: true, task: null, status: colStatus })
                    }
                    className="rounded p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800"
                    aria-label={`Add task to ${TASK_STATUS_LABELS[colStatus]}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Column Tasks */}
                <div className="flex-1 space-y-2.5">
                  {columnTasks.length === 0 ? (
                    <div className="flex h-28 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
                      <p className="text-xs text-slate-400">No tasks in this column</p>
                      <button
                        type="button"
                        onClick={() =>
                          setTaskModal({ open: true, task: null, status: colStatus })
                        }
                        className="mt-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                      >
                        + Add a task
                      </button>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        assignee={userById[task.assigneeId]}
                        onClick={() => setDetailsTask(task)}
                      />
                    ))
                  )}
                </div>

                {/* Quick Add Button */}
                <button
                  type="button"
                  onClick={() =>
                    setTaskModal({ open: true, task: null, status: colStatus })
                  }
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add task
                </button>
              </section>
            )
          })}
        </div>
      ) : (
        <TaskTable
          tasks={projectTasks}
          projectById={projectById}
          userById={userById}
          onOpen={setDetailsTask}
          onEdit={(task) => setTaskModal({ open: true, task, status: task.status })}
          onDelete={async (task) => {
            await deleteTask(task.id)
            showToast({ message: 'Task deleted', type: 'info' })
          }}
          onStatusChange={async (id, nextStatus) => {
            await updateTask(id, { status: nextStatus })
            showToast({
              message: `Status updated to ${TASK_STATUS_LABELS[nextStatus]}`,
              type: 'success',
            })
          }}
        />
      )}

      {/* Task Create / Edit Modal */}
      <TaskFormModal
        open={taskModal.open}
        task={taskModal.task}
        projects={projects}
        users={users}
        defaultProjectId={project.id}
        defaultStatus={taskModal.status}
        loading={isMutating}
        onClose={() => setTaskModal({ open: false, task: null, status: 'TODO' })}
        onSubmit={async (payload) => {
          if (taskModal.task) {
            const res = await updateTask(taskModal.task.id, payload)
            if (res?.ok) showToast({ message: 'Task updated', type: 'success' })
            return res
          } else {
            const res = await createTask({ ...payload, projectId: project.id })
            if (res?.ok) showToast({ message: 'Task created', type: 'success' })
            return res
          }
        }}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        open={Boolean(detailsTask)}
        task={detailsTask}
        project={project}
        assignee={userById[detailsTask?.assigneeId]}
        users={users}
        onClose={() => setDetailsTask(null)}
        onEdit={(task) => {
          setDetailsTask(null)
          setTaskModal({ open: true, task, status: task.status })
        }}
        onDelete={(task) => {
          setDetailsTask(null)
          setTaskToDelete(task)
        }}
        onChangeStatus={async (id, nextStatus) => {
          await updateTask(id, { status: nextStatus })
          setDetailsTask((prev) => (prev ? { ...prev, status: nextStatus } : prev))
          showToast({
            message: `Moved to ${TASK_STATUS_LABELS[nextStatus]}`,
            type: 'success',
          })
        }}
        onChangePriority={async (id, nextPriority) => {
          await updateTask(id, { priority: nextPriority })
          setDetailsTask((prev) => (prev ? { ...prev, priority: nextPriority } : prev))
          showToast({
            message: `Priority set to ${PRIORITY_LABELS[nextPriority]}`,
            type: 'info',
          })
        }}
        onAssign={async (id, nextAssigneeId) => {
          await updateTask(id, { assigneeId: nextAssigneeId })
          setDetailsTask((prev) => (prev ? { ...prev, assigneeId: nextAssigneeId } : prev))
          showToast({ message: 'Assignee updated', type: 'info' })
        }}
      />

      {/* Edit Project Modal */}
      <ProjectFormModal
        open={editProjectOpen}
        project={project}
        loading={isMutating}
        onClose={() => setEditProjectOpen(false)}
        onSubmit={async (payload) => {
          const res = await updateProject(project.id, payload)
          if (res?.ok) showToast({ message: 'Project details updated', type: 'success' })
          return res
        }}
      />

      {/* Delete Project Confirm Modal */}
      <ConfirmModal
        open={deleteProjectOpen}
        onClose={() => setDeleteProjectOpen(false)}
        onConfirm={async () => {
          await deleteProject(project.id)
          showToast({ message: `Project "${project.name}" deleted`, type: 'info' })
          navigate('/projects')
        }}
        title="Delete project"
        message={`Are you sure you want to delete "${project.name}"? All associated tasks will also be permanently deleted.`}
      />

      {/* Delete Task Confirm Modal */}
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
        message={`Are you sure you want to delete "${taskToDelete?.title}"?`}
      />
    </div>
  )
}
