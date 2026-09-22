import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Input from './ui/Input'
import Select from './ui/Select'
import Textarea from './ui/Textarea'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  PRIORITY_LABELS,
} from '../data/constants'

const COMMON_TAGS = ['frontend', 'backend', 'design', 'bug', 'feature', 'devops', 'docs']

function TaskFormContent({
  open,
  onClose,
  onSubmit,
  loading,
  task,
  projects,
  users,
  defaultProjectId,
  defaultStatus,
}) {
  const [form, setForm] = useState(() => {
    if (task) {
      return {
        title: task.title || '',
        description: task.description || '',
        projectId: task.projectId || '',
        status: task.status || 'TODO',
        priority: task.priority || 'MEDIUM',
        assigneeId: task.assigneeId || '',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        labels: Array.isArray(task.labels) ? [...task.labels] : [],
      }
    }
    return {
      title: '',
      description: '',
      projectId: defaultProjectId || '',
      status: defaultStatus || 'TODO',
      priority: 'MEDIUM',
      assigneeId: '',
      dueDate: '',
      labels: [],
    }
  })
  const [errors, setErrors] = useState({})
  const [newTagInput, setNewTagInput] = useState('')

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const addTag = (tag) => {
    const trimmed = tag.trim().toLowerCase()
    if (!trimmed || form.labels.includes(trimmed)) return
    setForm((prev) => ({ ...prev, labels: [...prev.labels, trimmed] }))
    setNewTagInput('')
  }

  const removeTag = (tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      labels: prev.labels.filter((tag) => tag !== tagToRemove),
    }))
  }

  const setPresetDate = (daysFromNow) => {
    const d = new Date()
    d.setDate(d.getDate() + daysFromNow)
    const formatted = d.toISOString().slice(0, 10)
    update('dueDate', formatted)
  }

  const validate = () => {
    const next = {}
    if (!form.title.trim()) next.title = 'Title is required.'
    if (!form.projectId) next.projectId = 'Project is required.'
    if (!form.status) next.status = 'Status is required.'
    if (!form.priority) next.priority = 'Priority is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    const result = await onSubmit({
      ...form,
      dueDate: form.dueDate ? `${form.dueDate}T00:00:00.000Z` : null,
      assigneeId: form.assigneeId || null,
      labels: form.labels,
    })
    if (result?.ok) onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task ? 'Edit task' : 'New task'}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="task-form" loading={loading}>
            {loading ? 'Saving…' : task ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Input
          id="task-title"
          className="sm:col-span-2"
          label="Task title"
          required
          value={form.title}
          error={errors.title}
          onChange={(event) => update('title', event.target.value)}
          placeholder="e.g. Implement user registration validation"
        />
        <Textarea
          id="task-description"
          className="sm:col-span-2"
          label="Description"
          rows={3}
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="Detailed task description or acceptance criteria..."
        />
        <Select
          id="task-project"
          label="Project"
          required
          value={form.projectId}
          error={errors.projectId}
          onChange={(event) => update('projectId', event.target.value)}
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
        <Select
          id="task-assignee"
          label="Assignee"
          value={form.assigneeId}
          onChange={(event) => update('assigneeId', event.target.value)}
        >
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </Select>
        <Select
          id="task-status"
          label="Status"
          required
          value={form.status}
          error={errors.status}
          onChange={(event) => update('status', event.target.value)}
        >
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {TASK_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        <Select
          id="task-priority"
          label="Priority"
          required
          value={form.priority}
          error={errors.priority}
          onChange={(event) => update('priority', event.target.value)}
        >
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </Select>

        <div className="sm:col-span-2 space-y-1">
          <Input
            id="task-due"
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={(event) => update('dueDate', event.target.value)}
          />
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
            <span>Presets:</span>
            <button
              type="button"
              onClick={() => setPresetDate(0)}
              className="rounded bg-slate-100 px-2 py-0.5 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPresetDate(1)}
              className="rounded bg-slate-100 px-2 py-0.5 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setPresetDate(7)}
              className="rounded bg-slate-100 px-2 py-0.5 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              In 1 week
            </button>
          </div>
        </div>

        {/* Labels / Tags Section */}
        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Labels
          </label>
          <div className="flex flex-wrap gap-1.5 min-h-7 items-center">
            {form.labels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                #{label}
                <button
                  type="button"
                  onClick={() => removeTag(label)}
                  className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag(newTagInput)
                }
              }}
              placeholder="Add label and press enter"
              className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => addTag(newTagInput)}
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-400">
            <span>Suggestions:</span>
            {COMMON_TAGS.filter((t) => !form.labels.includes(t)).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="rounded border border-dashed border-slate-200 px-1.5 py-0.5 hover:border-slate-400 hover:text-slate-700 dark:border-slate-700 dark:hover:text-slate-300"
              >
                +{tag}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default function TaskFormModal(props) {
  if (!props.open) return null
  return (
    <TaskFormContent
      key={props.task ? props.task.id : `new-${props.defaultProjectId}-${props.defaultStatus}`}
      {...props}
    />
  )
}
