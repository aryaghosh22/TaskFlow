import { Calendar, GripVertical } from 'lucide-react'
import UserAvatar from './UserAvatar'
import PriorityBadge from './PriorityBadge'
import { formatDate, isOverdue } from '../utils/format'

export default function TaskCard({
  task,
  assignee,
  onClick,
  isDraggable = true,
}) {
  const overdue = isOverdue(task.dueDate, task.status)

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className="group relative w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-3 text-left shadow-xs transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-900 group-hover:text-brand-600 dark:text-slate-50 dark:group-hover:text-brand-400 transition-colors">
          {task.title}
        </h4>
        <div className="flex items-center gap-1 shrink-0">
          <PriorityBadge priority={task.priority} />
          {isDraggable ? (
            <GripVertical className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 dark:text-slate-600 transition-opacity" />
          ) : null}
        </div>
      </div>

      {task.description ? (
        <p className="mb-2.5 line-clamp-2 text-xs text-slate-500 leading-relaxed">
          {task.description}
        </p>
      ) : null}

      {task.labels?.length ? (
        <div className="mb-3 flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label}
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              #{label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800/80">
        <span
          className={`inline-flex items-center gap-1 text-xs ${
            overdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-500'
          }`}
        >
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
        </span>
        <UserAvatar user={assignee} size="sm" />
      </div>
    </div>
  )
}
