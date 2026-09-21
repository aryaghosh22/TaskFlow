import { initials } from '../utils/format'

export default function UserAvatar({ user, size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-16 w-16 text-lg',
  }

  if (!user) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-slate-200 font-medium text-slate-500 ${sizes[size]} ${className}`}
      >
        —
      </span>
    )
  }

  return (
    <span
      title={user.name}
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white ${sizes[size]} ${className}`}
      style={{ backgroundColor: user.avatarColor || '#4f46e5' }}
    >
      {initials(user.name)}
    </span>
  )
}
