import { cx } from '../../lib/utils';

const VARIANTS = {
  primary: 'btn-primary text-white dark:text-[#04120E] brutal:!text-white',
  secondary: 'bg-raised text-ink hover:bg-line border border-line active:brightness-95',
  ghost: 'text-ink hover:bg-raised',
  destructive: 'fill-coral-soft text-coral border border-coral-soft hover:brightness-110',
  violet: 'fill-violet-soft text-violet border border-violet-soft hover:brightness-110',
  outline: 'bg-card text-ink border border-line hover:bg-raised',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-[15px] gap-2',
};

export function Button({ variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, className, children, ...rest }) {
  return (
    <button
      className={cx(
        'focus-ring inline-flex select-none items-center justify-center rounded-lg font-semibold transition-all duration-[280ms] ease-sb-spring active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2.2} />}
      {children}
      {IconRight && <IconRight size={size === 'sm' ? 14 : 16} strokeWidth={2.2} />}
    </button>
  );
}

export function IconButton({ label, icon: Icon, size = 16, className, ...rest }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx('focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted transition-all duration-[280ms] ease-sb-spring active:scale-90 hover:bg-raised hover:text-ink', className)}
      {...rest}
    >
      <Icon size={size} strokeWidth={2.2} />
    </button>
  );
}
