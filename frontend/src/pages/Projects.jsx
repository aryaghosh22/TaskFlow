import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderKanban, LayoutGrid, List, Plus, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAppData } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import EmptyState from '../components/ui/EmptyState'
import ProjectCard from '../components/ProjectCard'
import ProjectFormModal from '../components/ProjectFormModal'
import ProjectStatusBadge from '../components/ProjectStatusBadge'
import ConfirmModal from '../components/ui/ConfirmModal'
import ProgressBar from '../components/ui/ProgressBar'
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from '../data/constants'
import { formatDate } from '../utils/format'

export default function Projects() {
  const { user } = useAuth()
  const {
    projects,
    tasks,
    users,
    createProject,
    updateProject,
    deleteProject,
    isMutating,
  } = useAppData()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ALL')
  const [sort, setSort] = useState('updated')
  const [view, setView] = useState('grid')

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState(null)
  const [projectToDelete, setProjectToDelete] = useState(null)

  const userById = useMemo(
    () => Object.fromEntries(users.map((item) => [item.id, item])),
    [users],
  )

  const statsFor = (project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id)
    const completed = projectTasks.filter((task) => task.status === 'COMPLETED').length
    return {
      count: projectTasks.length,
      progress: projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0,
    }
  }

  const filtered = useMemo(() => {
    let list = projects.filter((project) => {
      const q = query.toLowerCase()
      const matchesQuery =
        project.name.toLowerCase().includes(q) ||
        (project.description && project.description.toLowerCase().includes(q))
      const matchesStatus = status === 'ALL' || project.status === status
      return matchesQuery && matchesStatus
    })

    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'created') return new Date(b.createdAt) - new Date(a.createdAt)
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })

    return list
  }, [projects, query, status, sort])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Projects
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage your team workspaces and monitor delivery progress.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4" /> New project
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="project-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <Select
          id="project-filter"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="lg:w-44"
        >
          <option value="ALL">All statuses</option>
          {PROJECT_STATUSES.map((item) => (
            <option key={item} value={item}>
              {PROJECT_STATUS_LABELS[item]}
            </option>
          ))}
        </Select>

        <Select
          id="project-sort"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="lg:w-44"
        >
          <option value="updated">Last updated</option>
          <option value="created">Date created</option>
          <option value="name">Project name</option>
        </Select>

        <div className="flex items-center gap-1 lg:ml-auto self-end lg:self-auto rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={`rounded-md p-1.5 transition-colors ${
              view === 'grid'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`rounded-md p-1.5 transition-colors ${
              view === 'list'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Projects Display */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects match your search"
          description="Try adjusting your search terms or filter criteria, or create a new project."
          action={
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4" /> New project
            </Button>
          }
        />
      ) : view === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 items-stretch">
          {filtered.map((project) => {
            const { count, progress } = statsFor(project)
            return (
              <ProjectCard
                key={project.id}
                project={project}
                owner={userById[project.ownerId]}
                taskCount={count}
                progress={progress}
                onOpen={() => navigate(`/projects/${project.id}`)}
                onEdit={() => setProjectToEdit(project)}
                onArchive={async () => {
                  const nextStatus = project.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED'
                  await updateProject(project.id, { status: nextStatus })
                  showToast({
                    message: `Project ${nextStatus === 'ARCHIVED' ? 'archived' : 'restored'}`,
                    type: 'info',
                  })
                }}
                onDelete={() => setProjectToDelete(project)}
              />
            )
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((project) => {
            const { count, progress } = statsFor(project)
            return (
              <div
                key={project.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="font-semibold text-slate-900 hover:text-brand-600 dark:text-slate-50 dark:hover:text-brand-400 text-left block truncate"
                  >
                    {project.name}
                  </button>
                  <p className="truncate text-xs text-slate-500 mt-0.5">
                    {project.description || 'No description'}
                  </p>
                </div>
                <ProjectStatusBadge status={project.status} />
                <div className="w-36">
                  <ProgressBar value={progress} />
                </div>
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  {count} {count === 1 ? 'task' : 'tasks'}
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {formatDate(project.updatedAt)}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setProjectToEdit(project)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New Project Modal */}
      <ProjectFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        loading={isMutating}
        onSubmit={async (payload) => {
          const res = await createProject({ ...payload, ownerId: user?.id || 'usr_1' })
          if (res?.ok) showToast({ message: 'Project created successfully', type: 'success' })
          return res
        }}
      />

      {/* Edit Project Modal */}
      <ProjectFormModal
        open={Boolean(projectToEdit)}
        project={projectToEdit}
        onClose={() => setProjectToEdit(null)}
        loading={isMutating}
        onSubmit={async (payload) => {
          if (projectToEdit) {
            const res = await updateProject(projectToEdit.id, payload)
            if (res?.ok) {
              showToast({ message: 'Project updated successfully', type: 'success' })
              setProjectToEdit(null)
            }
            return res
          }
        }}
      />

      {/* Delete Project Confirm Modal */}
      <ConfirmModal
        open={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        onConfirm={async () => {
          if (projectToDelete) {
            await deleteProject(projectToDelete.id)
            showToast({ message: `Project "${projectToDelete.name}" deleted`, type: 'info' })
            setProjectToDelete(null)
          }
        }}
        title="Delete project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? All associated tasks will also be deleted permanently.`}
      />
    </div>
  )
}
