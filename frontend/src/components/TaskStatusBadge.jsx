import Badge from './ui/Badge'
import { TASK_STATUS_LABELS } from '../data/constants'

const TONES = {
  TODO: 'slate',
  IN_PROGRESS: 'blue',
  REVIEW: 'amber',
  COMPLETED: 'green',
}

export default function TaskStatusBadge({ status }) {
  return <Badge tone={TONES[status] || 'slate'}>{TASK_STATUS_LABELS[status] || status}</Badge>
}
