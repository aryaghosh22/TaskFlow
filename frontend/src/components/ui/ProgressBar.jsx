export default function ProgressBar({ value = 0, className = '' }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>Progress</span>
        <span className="font-medium text-slate-700 dark:text-slate-200">{clamped}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-brand-600 transition-[width]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
