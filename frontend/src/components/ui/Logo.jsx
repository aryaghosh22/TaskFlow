export default function Logo({
  size = 'md',
  showText = true,
  subtitle,
  className = '',
}) {
  const sizeMap = {
    sm: {
      img: 'h-7 w-auto',
      title: 'text-sm',
      sub: 'text-[9px]',
    },
    md: {
      img: 'h-9 w-auto',
      title: 'text-base',
      sub: 'text-[10px]',
    },
    lg: {
      img: 'h-11 w-auto',
      title: 'text-lg',
      sub: 'text-xs',
    },
  }

  const currentSize = sizeMap[size] || sizeMap.md

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon Image */}
      <img
        src="/logo.png"
        alt="TaskFlow Logo"
        className={`${currentSize.img} shrink-0 object-contain drop-shadow-sm select-none`}
      />

      {/* Brand Typography */}
      {showText && (
        <div className="leading-tight">
          <div className={`font-bold tracking-tight text-slate-900 dark:text-slate-50 ${currentSize.title} flex items-center gap-1`}>
            <span>Task</span>
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-300">
              Flow
            </span>
          </div>
          {subtitle && (
            <p className={`font-medium text-slate-500 dark:text-slate-400 ${currentSize.sub}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
