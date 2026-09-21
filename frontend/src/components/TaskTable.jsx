import { useState } from 'react'
import { MoreHorizontal, Calendar } from 'lucide-react'
import TaskStatusBadge from './TaskStatusBadge'
import PriorityBadge from './PriorityBadge'
import UserAvatar from './UserAvatar'
import Dropdown, { DropdownItem } from './ui/Dropdown'
import ConfirmModal from './ui/ConfirmModal'
import { formatDate, isOverdue } from '../utils/format'
import { TASK_STATUSES, TASK_STATUS_LABELS } from '../data/constants'

export default function TaskTable({
  tasks,
  projectById,
  userById,
  onOpen,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const [taskToDelete, setTaskToDelete] = useState(null)

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        {/* Desktop Table View */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3.5">Task</th>
                <th className="px-4 py-3.5">Project</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Assignee</th>
                <th className="px-4 py-3.5">Due date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {tasks.map((task) => {
                const project = projectById[task.projectId]
                const assignee = userById[task.assigneeId]
                const overdue = isOverdue(task.dueDate, task.status)

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => onOpen(task)}
                          className="font-medium text-slate-900 hover:text-brand-600 dark:text-slate-50 dark:hover:text-brand-400 text-left block"
                        >
                          {task.title}
                        </button>
                        {task.labels?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {task.labels.map((label) => (
                              <span
                                key={label}
                                className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                              >
                                #{label}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                      {project?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {onStatusChange ? (
                        <select
                          value={task.status}
                          onChange={(e) => onStatusChange(task.id, e.target.value)}
                          className="h-7 rounded border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                        >
                          {TASK_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {TASK_STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <TaskStatusBadge status={task.status} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar user={assignee} size="sm" />
                        <span className="text-slate-700 dark:text-slate-300">
                          {assignee?.name || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-4 py-3 ${
                        overdue
                          ? 'font-medium text-red-600 dark:text-red-400'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {task.dueDate ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(task.dueDate)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Dropdown
                        trigger={
                          <button
                            type="button"
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                            aria-label="Task actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        }
                      >
                        <DropdownItem onClick={() => onOpen(task)}>View details</DropdownItem>
                        <DropdownItem onClick={() => onEdit(task)}>Edit task</DropdownItem>
                        <DropdownItem danger onClick={() => setTaskToDelete(task)}>
                          Delete
                        </DropdownItem>
                      </Dropdown>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="divide-y divide-slate-100 p-3 md:hidden dark:divide-slate-800">
          {tasks.map((task) => {
            const project = projectById[task.projectId]
            const assignee = userById[task.assigneeId]
            const overdue = isOverdue(task.dueDate, task.status)

            return (
              <div key={task.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpen(task)}
                    className="font-medium text-slate-900 dark:text-slate-50 text-left"
                  >
                    {task.title}
                  </button>
                  <PriorityBadge priority={task.priority} />
                </div>
                <p className="mt-1 text-xs text-slate-500 font-medium">{project?.name}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <TaskStatusBadge status={task.status} />
                  {task.dueDate ? (
                    <span
                      className={`inline-flex items-center gap-1 text-xs ${
                        overdue ? 'text-red-600 font-medium' : 'text-slate-500'
                      }`}
                    >
                      <Calendar className="h-3 w-3" />
                      {formatDate(task.dueDate)}
                    </span>
                  ) : null}
                  <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <UserAvatar user={assignee} size="sm" />
                    {assignee?.name || 'Unassigned'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <ConfirmModal
        open={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={async () => {
          if (taskToDelete) {
            await onDelete(taskToDelete)
            setTaskToDelete(null)
          }
        }}
        title="Delete task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This cannot be undone.`}
      />
    </>
  )
}
