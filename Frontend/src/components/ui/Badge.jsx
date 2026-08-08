import { cx } from '../../lib/utils';

const VARIANTS = {
  teal: 'badge-teal',
  amber: 'badge-amber',
  coral: 'badge-coral',
  violet: 'badge-violet',
  azure: 'badge-azure',
  neutral: 'badge-neutral',
};

const SIZES = { sm: 'px-2 py-0.5 text-[11px]', md: 'px-2.5 py-1 text-xs' };

export function Badge({ variant = 'neutral', size = 'sm', dot = false, sharp = false, className, children }) {
  if (sharp) {
    return (
      <span className={cx('sb-badge-sharp', SIZES[size], className)}>
        {dot && <span className="sb-status-dot square" aria-hidden="true" />}
        {children}
      </span>
    );
  }
  return (
    <span className={cx('badge brutal:sb-badge-sharp brutal:rounded-none', VARIANTS[variant] ?? VARIANTS.neutral, SIZES[size], className)}>
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full brutal:rounded-none brutal:h-[7px] brutal:w-[7px]"
          style={{
            background: 'currentColor',
            boxShadow: '0 0 6px currentColor',
          }}
        />
      )}
      {children}
    </span>
  );
}

// Priority badge using the shared signal accents
const PRIORITY_VARIANT = { high: 'coral', medium: 'amber', low: 'teal' };
export function PriorityBadge({ priority, ...rest }) {
  return (
    <Badge variant={PRIORITY_VARIANT[priority] ?? 'neutral'} dot {...rest}>
      {priority}
    </Badge>
  );
}
