import { cx } from '../../lib/utils';

export function Card({ elevated = false, glass = false, hover = false, className, children, ...rest }) {
  return (
    <div
      className={cx(
        'rounded-xl border border-line bg-card',
        elevated && 'shadow-soft',
        glass && 'glass-popover border-0',
        hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pop',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, action, className }) {
  return (
    <div className={cx('flex items-center justify-between gap-3 px-5 pt-5', className)}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg fill-teal-soft text-teal">
            <Icon size={16} />
          </span>
        )}
        <div>
          <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
