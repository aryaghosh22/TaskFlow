import { useState } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Input from './ui/Input'
import Select from './ui/Select'
import Textarea from './ui/Textarea'
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from '../data/constants'

function ProjectFormContent({
  open,
  onClose,
  onSubmit,
  loading = false,
  project = null,
}) {
  const [form, setForm] = useState(() => ({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'ACTIVE',
    deadline: project?.deadline ? project.deadline.slice(0, 10) : '',
  }))
  const [errors, setErrors] = useState({})

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Project name is required.'
    else if (form.name.trim().length < 3) next.name = 'Use at least 3 characters.'
    if (!form.status) next.status = 'Status is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    const result = await onSubmit(form)
    if (result?.ok) {
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={project ? 'Edit project' : 'New project'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="project-form" loading={loading}>
            {loading ? 'Saving…' : project ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="project-name"
          label="Project name"
          required
          value={form.name}
          error={errors.name}
          onChange={(event) => update('name', event.target.value)}
          placeholder="e.g. Marketing website"
        />
        <Textarea
          id="project-description"
          label="Description"
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="What is the goal of this project?"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="project-status"
            label="Status"
            required
            value={form.status}
            error={errors.status}
            onChange={(event) => update('status', event.target.value)}
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PROJECT_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
          <Input
            id="project-deadline"
            label="Deadline"
            type="date"
            value={form.deadline}
            onChange={(event) => update('deadline', event.target.value)}
          />
        </div>
      </form>
    </Modal>
  )
}

export default function ProjectFormModal(props) {
  if (!props.open) return null
  return <ProjectFormContent key={props.project?.id || 'new-project'} {...props} />
}
