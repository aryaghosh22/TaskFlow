export default function Card({ children, className = '', padding = true }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${
        padding ? 'p-5' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
