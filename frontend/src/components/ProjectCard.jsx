import { Link } from 'react-router-dom'
import { MoreHorizontal, Calendar, CheckSquare, Edit2, Archive, Trash2 } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import Dropdown, { DropdownItem } from './ui/Dropdown'
import ProgressBar from './ui/ProgressBar'
import ProjectStatusBadge from './ProjectStatusBadge'
import UserAvatar from './UserAvatar'
import { formatDate } from '../utils/format'

export default function ProjectCard({
  project,
  owner,
  taskCount,
  progress,
  onOpen,
  onEdit,
  onArchive,
  onDelete,
}) {
  const isArchived = project.status === 'ARCHIVED'

  return (
    <Card className="flex h-full flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            to={`/projects/${project.id}`}
            className="text-base font-semibold text-slate-900 hover:text-brand-600 dark:text-slate-50 dark:hover:text-brand-400 block truncate"
          >
            {project.name}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 leading-relaxed">
            {project.description || 'No description provided.'}
          </p>
        </div>
        <Dropdown
          trigger={
            <button
              type="button"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
              aria-label="Project actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          }
        >
          <DropdownItem onClick={onOpen}>
            <CheckSquare className="h-4 w-4 mr-2" /> View tasks
          </DropdownItem>
          {onEdit ? (
            <DropdownItem onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-2" /> Edit project
            </DropdownItem>
          ) : null}
          {onArchive ? (
            <DropdownItem onClick={onArchive}>
              <Archive className="h-4 w-4 mr-2" /> {isArchived ? 'Restore' : 'Archive'}
            </DropdownItem>
          ) : null}
          {onDelete ? (
            <DropdownItem danger onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownItem>
          ) : null}
        </Dropdown>
      </div>

      <div className="mb-4 flex items-center justify-between gap-2">
        <ProjectStatusBadge status={project.status} />
        {project.deadline ? (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {formatDate(project.deadline)}
          </span>
        ) : null}
      </div>

      <ProgressBar value={progress} className="mb-4" />

      <div className="mt-auto border-t border-slate-100 pt-3 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <UserAvatar user={owner} size="sm" />
          <span className="truncate max-w-[110px] font-medium text-slate-700 dark:text-slate-300">
            {owner?.name || 'Unassigned'}
          </span>
        </div>
        <span className="font-medium text-slate-600 dark:text-slate-400">
          {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={onOpen}>
        Open project
      </Button>
    </Card>
  )
}
