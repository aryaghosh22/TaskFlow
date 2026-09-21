import Badge from './ui/Badge'
import { PRIORITY_LABELS } from '../data/constants'

const TONES = {
  LOW: 'slate',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red',
}

export default function PriorityBadge({ priority }) {
  return <Badge tone={TONES[priority] || 'slate'}>{PRIORITY_LABELS[priority] || priority}</Badge>
}
