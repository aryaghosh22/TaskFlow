export default function Textarea({
  id,
  label,
  error,
  required = false,
  className = '',
  rows = 4,
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
      <textarea
        id={id}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={`w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 ${
          error
            ? 'border-red-400'
            : 'border-slate-200 focus:border-brand-600 dark:border-slate-700'
        }`}
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  )
}
