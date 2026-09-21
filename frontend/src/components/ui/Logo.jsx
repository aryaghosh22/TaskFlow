export default function Logo({
  size = 'md',
  showText = true,
  subtitle,
  className = '',
}) {
  const sizeMap = {
    sm: {
      box: 'h-7 w-7',
      svg: 28,
      title: 'text-sm',
      sub: 'text-[9px]',
    },
    md: {
      box: 'h-9 w-9',
      svg: 36,
      title: 'text-base',
      sub: 'text-[10px]',
    },
    lg: {
      box: 'h-11 w-11',
      svg: 44,
      title: 'text-lg',
      sub: 'text-xs',
    },
  }

  const currentSize = sizeMap[size] || sizeMap.md

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon */}
      <div
        className={`relative flex ${currentSize.box} shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/20`}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full p-1.5"
        >
          <defs>
            <linearGradient id="tf-flow-grad" x1="6" y1="6" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#e0e7ff" />
            </linearGradient>
            <filter id="tf-glow" x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Flow background arc */}
          <path
            d="M9 13.5C9 10.46 11.46 8 14.5 8H21.5C24.54 8 27 10.46 27 13.5C27 16.54 24.54 19 21.5 19H14.5"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Dynamic check & forward flow mark */}
          <path
            d="M9.5 19L14.5 24L26.5 12"
            stroke="url(#tf-flow-grad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#tf-glow)"
          />

          {/* Glowing flow pulse accent */}
          <circle cx="26" cy="23" r="2.2" fill="#38bdf8" />
        </svg>
      </div>

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
