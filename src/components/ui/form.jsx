import { cx } from '../../lib/utils';

export function Label({ children, className }) {
  return (
    <label className={cx('mb-1.5 block text-[13px] font-medium text-ink', className)}>
      {children}
    </label>
  );
}

export function Field({ label, hint, error, children, className }) {
  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-coral">{error}</p>}
    </div>
  );
}

const fieldBase =
  'focus-ring ph-muted w-full rounded-lg border border-line bg-raised px-3 text-sm text-ink transition-colors focus:border-teal disabled:opacity-50';

export function Input({ className, ...rest }) {
  return <input className={cx(fieldBase, 'h-9', className)} {...rest} />;
}

export function Textarea({ className, ...rest }) {
  return <textarea className={cx(fieldBase, 'min-h-[96px] resize-y py-2 leading-relaxed', className)} {...rest} />;
}

export function Select({ className, children, ...rest }) {
  return (
    <div className={cx('relative', className)}>
      <select className={cx(fieldBase, 'h-9 cursor-pointer appearance-none pr-8')} {...rest}>
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

export function Toggle({ checked, onChange, label, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={cx('focus-ring flex items-center gap-2.5', className)}
    >
      <span
        className={cx(
          'relative h-5 w-9 rounded-full transition-colors duration-200',
          checked ? 'bg-teal' : 'bg-line'
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition-all duration-200',
            checked ? 'left-[18px]' : 'left-0.5'
          )}
        />
      </span>
      {label && <span className="text-sm font-medium text-ink">{label}</span>}
    </button>
  );
}
