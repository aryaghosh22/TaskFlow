import Badge from './ui/Badge'
import { PROJECT_STATUS_LABELS } from '../data/constants'

const TONES = {
  ACTIVE: 'green',
  COMPLETED: 'indigo',
  ARCHIVED: 'slate',
}

export default function ProjectStatusBadge({ status }) {
  return <Badge tone={TONES[status] || 'slate'}>{PROJECT_STATUS_LABELS[status] || status}</Badge>
}
