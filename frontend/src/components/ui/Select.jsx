export default function Select({
  id,
  label,
  error,
  required = false,
  className = '',
  children,
  ...props
}) {
  return (
    <label className={`block ${className}`} htmlFor={id}>
      {label ? (
        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required ? <span className="ml-0.5 text-red-600">*</span> : null}
        </span>
      ) : null}
      <select
        id={id}
        aria-invalid={Boolean(error)}
        className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 dark:bg-slate-900 dark:text-slate-100 ${
          error
            ? 'border-red-400'
            : 'border-slate-200 focus:border-brand-600 dark:border-slate-700'
        }`}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  )
}
