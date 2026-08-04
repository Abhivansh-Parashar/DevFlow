import { cx } from '../../lib/utils';
import { Button } from './Button';

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className, compact = false }) {
  return (
    <div className={cx('flex flex-col items-center justify-center text-center', compact ? 'px-4 py-8' : 'px-6 py-16', className)}>
      {Icon && (
        <span className={cx('grid place-items-center rounded-2xl fill-teal-soft text-teal', compact ? 'mb-3 h-10 w-10' : 'mb-4 h-14 w-14')}>
          <Icon size={compact ? 18 : 24} strokeWidth={1.8} />
        </span>
      )}
      <h3 className={cx('font-display font-semibold text-ink', compact ? 'text-sm' : 'text-lg')}>{title}</h3>
      {description && <p className={cx('mt-1 max-w-sm text-muted', compact ? 'text-xs' : 'text-sm')}>{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction} size={compact ? 'sm' : 'md'}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
