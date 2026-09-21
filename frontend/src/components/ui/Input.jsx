export default function Input({
  id,
  label,
  error,
  required = false,
  className = '',
  type = 'text',
  hint,
  rightSlot,
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
      <div className="relative">
        <input
          id={id}
          type={type}
          aria-invalid={Boolean(error)}
          className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 ${
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-slate-200 focus:border-brand-600 dark:border-slate-700'
          } ${rightSlot ? 'pr-10' : ''}`}
          {...props}
        />
        {rightSlot ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">{rightSlot}</div>
        ) : null}
      </div>
      {hint && !error ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  )
}
