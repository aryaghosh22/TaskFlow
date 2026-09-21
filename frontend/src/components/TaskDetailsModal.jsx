import { Calendar, FolderKanban, Tag } from 'lucide-react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Select from './ui/Select'
import TaskStatusBadge from './TaskStatusBadge'
import PriorityBadge from './PriorityBadge'
import UserAvatar from './UserAvatar'
import { formatDate, formatDateTime, isOverdue } from '../utils/format'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  PRIORITY_LABELS,
} from '../data/constants'

export default function TaskDetailsModal({
  open,
  task,
  project,
  assignee,
  onClose,
  onEdit,
  onDelete,
  onChangeStatus,
  onChangePriority,
  onAssign,
  users,
}) {
  if (!task) return null

  const overdue = isOverdue(task.dueDate, task.status)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task.title}
      wide
      footer={
        <>
          <Button variant="danger" onClick={() => onDelete(task)}>
            Delete
          </Button>
          <Button variant="secondary" onClick={() => onEdit(task)}>
            Edit details
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Description
          </h4>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
            {task.description || 'No description provided for this task.'}
          </p>
        </div>

        {/* Labels if present */}
        {task.labels?.length ? (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" /> Labels
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map((label) => (
                <span
                  key={label}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  #{label}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Quick Attribute Controls */}
        <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div>
            <label
              htmlFor="detail-status"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Status
            </label>
            <Select
              id="detail-status"
              value={task.status}
              onChange={(event) => onChangeStatus(task.id, event.target.value)}
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label
              htmlFor="detail-priority"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Priority
            </label>
            <Select
              id="detail-priority"
              value={task.priority}
              onChange={(event) => onChangePriority(task.id, event.target.value)}
            >
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label
              htmlFor="detail-assignee"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Assignee
            </label>
            <Select
              id="detail-assignee"
              value={task.assigneeId || ''}
              onChange={(event) => onAssign(task.id, event.target.value || null)}
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Due Date
            </span>
            <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className={overdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}>
                {task.dueDate ? formatDate(task.dueDate) : 'No deadline'}
              </span>
              {overdue ? (
                <span className="ml-auto rounded bg-red-100 px-1.5 py-0.2 text-[11px] font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                  Overdue
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Current State Badges & Context */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <TaskStatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          <span className="inline-flex items-center gap-1.5">
            <FolderKanban className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-800 dark:text-slate-100">
              {project?.name || 'Project'}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UserAvatar user={assignee} size="sm" />
            <span>{assignee?.name || 'Unassigned'}</span>
          </span>
        </div>

        {/* Meta Info */}
        <div className="grid gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400 sm:grid-cols-2 dark:border-slate-800">
          <p>Created: {formatDateTime(task.createdAt)}</p>
          <p>Updated: {formatDateTime(task.updatedAt)}</p>
        </div>
      </div>
    </Modal>
  )
}
