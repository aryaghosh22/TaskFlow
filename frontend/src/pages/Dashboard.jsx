import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  ListTodo,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  Calendar,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAppData } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import ProjectStatusBadge from '../components/ProjectStatusBadge'
import TaskStatusBadge from '../components/TaskStatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import ProjectFormModal from '../components/ProjectFormModal'
import TaskFormModal from '../components/TaskFormModal'
import TaskDetailsModal from '../components/TaskDetailsModal'
import ConfirmModal from '../components/ui/ConfirmModal'
import UserAvatar from '../components/UserAvatar'
import { formatDate, greetingForHour, isOverdue } from '../utils/format'
import { TASK_STATUS_LABELS, PRIORITY_LABELS } from '../data/constants'

function projectStats(project, tasks) {
  const projectTasks = tasks.filter((task) => task.projectId === project.id)
  const completed = projectTasks.filter((task) => task.status === 'COMPLETED').length
  const progress = projectTasks.length
    ? Math.round((completed / projectTasks.length) * 100)
    : 0
  return { count: projectTasks.length, progress }
}

export default function Dashboard() {
  const { user } = useAuth()
  const {
    projects,
    tasks,
    users,
    createProject,
    createTask,
    updateTask,
    deleteTask,
    isMutating,
  } = useAppData()
  const { showToast } = useToast()
  const navigate = useNavigate()

  // Modal states
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [taskModal, setTaskModal] = useState({ open: false, task: null })
  const [detailsTask, setDetailsTask] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)

  const stats = useMemo(() => {
    const totalProjects = projects.length
    const totalTasks = tasks.length
    const inProgress = tasks.filter((task) => task.status === 'IN_PROGRESS').length
    const completed = tasks.filter((task) => task.status === 'COMPLETED').length
    const overdue = tasks.filter((task) => isOverdue(task.dueDate, task.status)).length
    const myTasks = tasks.filter((task) => task.assigneeId === user?.id && task.status !== 'COMPLETED').length

    return { totalProjects, totalTasks, inProgress, completed, overdue, myTasks }
  }, [projects, tasks, user?.id])

  const userById = useMemo(
    () => Object.fromEntries(users.map((item) => [item.id, item])),
    [users],
  )
  const projectById = useMemo(
    () => Object.fromEntries(projects.map((item) => [item.id, item])),
    [projects],
  )

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4)

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6)

  const metricCards = [
    {
      label: 'Active projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      description: 'Workspaces under management',
    },
    {
      label: 'Assigned to you',
      value: stats.myTasks,
      icon: ListTodo,
      description: 'Pending tasks in your queue',
    },
    {
      label: 'Tasks in progress',
      value: stats.inProgress,
      icon: Clock,
      description: 'Currently being worked on',
    },
    {
      label: 'Completed tasks',
      value: stats.completed,
      icon: CheckCircle2,
      description: `Across all ${stats.totalProjects} projects`,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            {greetingForHour()}, {user?.name?.split(' ')[0] || 'there'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Here is the current overview of your projects and team activities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setTaskModal({ open: true, task: null })}>
            <Plus className="h-3.5 w-3.5" /> New task
          </Button>
          <Button size="sm" onClick={() => setProjectModalOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New project
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <Card key={card.label} className="flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {card.value}
                </p>
              </div>
              <span className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <card.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-400 border-t border-slate-100 pt-2 dark:border-slate-800">
              {card.description}
            </p>
          </Card>
        ))}
      </div>

      {/* Recent Projects Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            Recent projects
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/projects')}
            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          >
            View all projects <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {recentProjects.map((project) => {
            const { count, progress } = projectStats(project, tasks)
            return (
              <Card key={project.id} className="flex flex-col justify-between">
                <div>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="font-semibold text-slate-900 hover:text-brand-600 dark:text-slate-50 dark:hover:text-brand-400 text-left truncate block"
                    >
                      {project.name}
                    </button>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                  <p className="line-clamp-2 text-xs text-slate-500 leading-relaxed mb-4">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{count} {count === 1 ? 'task' : 'tasks'}</span>
                    <span>Updated {formatDate(project.updatedAt)}</span>
                  </div>
                  <ProgressBar value={progress} />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    Open project
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Recent Activity / Tasks Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            Recent tasks
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/tasks')}
            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          >
            View all tasks <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        <Card padding={false}>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTasks.map((task) => {
              const overdue = isOverdue(task.dueDate, task.status)
              const project = projectById[task.projectId]
              const assignee = userById[task.assigneeId]

              return (
                <li
                  key={task.id}
                  onClick={() => setDetailsTask(task)}
                  className="flex flex-wrap items-center gap-3 px-4 py-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {project?.name || 'Project'}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                  <TaskStatusBadge status={task.status} />
                  <span
                    className={`inline-flex items-center gap-1 text-xs ${
                      overdue ? 'font-medium text-red-600' : 'text-slate-400'
                    }`}
                  >
                    <Calendar className="h-3 w-3" />
                    {task.dueDate ? formatDate(task.dueDate) : '—'}
                  </span>
                  <UserAvatar user={assignee} size="sm" />
                </li>
              )
            })}
          </ul>
        </Card>
      </section>

      {/* New Project Modal */}
      <ProjectFormModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        loading={isMutating}
        onSubmit={async (payload) => {
          const res = await createProject({ ...payload, ownerId: user?.id || 'usr_1' })
          if (res?.ok) showToast({ message: 'Project created successfully', type: 'success' })
          return res
        }}
      />

      {/* Task Modal (Create & Edit) */}
      <TaskFormModal
        open={taskModal.open}
        task={taskModal.task}
        projects={projects}
        users={users}
        loading={isMutating}
        onClose={() => setTaskModal({ open: false, task: null })}
        onSubmit={async (payload) => {
          if (taskModal.task) {
            const res = await updateTask(taskModal.task.id, payload)
            if (res?.ok) showToast({ message: 'Task updated successfully', type: 'success' })
            return res
          } else {
            const res = await createTask(payload)
            if (res?.ok) showToast({ message: 'Task created successfully', type: 'success' })
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
          setTaskModal({ open: true, task })
        }}
        onDelete={(task) => {
          setDetailsTask(null)
          setTaskToDelete(task)
        }}
        onChangeStatus={async (id, next) => {
          await updateTask(id, { status: next })
          setDetailsTask((prev) => (prev ? { ...prev, status: next } : prev))
          showToast({
            message: `Status updated to ${TASK_STATUS_LABELS[next]}`,
            type: 'success',
          })
        }}
        onChangePriority={async (id, next) => {
          await updateTask(id, { priority: next })
          setDetailsTask((prev) => (prev ? { ...prev, priority: next } : prev))
          showToast({
            message: `Priority set to ${PRIORITY_LABELS[next]}`,
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
        message={`Are you sure you want to delete "${taskToDelete?.title}"?`}
      />
    </div>
  )
}
