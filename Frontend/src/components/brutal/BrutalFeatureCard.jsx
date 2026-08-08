import { useRef } from 'react';
import { cx } from '../../lib/utils';

/**
 * Interactive Soft Brutalist feature card.
 * Hard offset shadow, hover tilt, crosshair corner with coordinate metadata.
 */
export function BrutalFeatureCard({
  icon: Icon,
  title,
  body,
  accent = 'teal',
  index,
  className,
  children,
}) {
  const ref = useRef(null);

  const accentMap = {
    teal: 'text-teal',
    amber: 'text-amber',
    violet: 'text-violet',
    azure: 'text-azure',
    coral: 'text-coral',
  };

  const fillMap = {
    teal: 'border-teal bg-teal/5',
    amber: 'border-amber bg-amber/5',
    violet: 'border-violet bg-violet/5',
    azure: 'border-azure bg-azure/5',
    coral: 'border-coral bg-coral/5',
  };

  const coord = index != null ? String(index + 1).padStart(2, '0') : null;

  return (
    <article
      ref={ref}
      data-coord={coord ? `${coord}.0` : undefined}
      className={cx(
        'sb-card sb-crosshair sb-tilt group relative h-full p-6',
        className,
      )}
    >
      {/* Hairline top rule */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-ink opacity-[0.06] brutal:opacity-100" aria-hidden="true" />

      {/* Index marker */}
      {index != null && (
        <span className="sb-index absolute right-5 top-5 text-[10px]">
          {String(index + 1).padStart(2, '0')}
        </span>
      )}

      {/* Icon block — sharp geometric container */}
      {Icon && (
        <span
          className={cx(
            'grid h-11 w-11 place-items-center border-2 border-ink/15 brutal:border-ink',
            fillMap[accent] ?? fillMap.teal,
          )}
        >
          <Icon size={19} strokeWidth={2.2} className={accentMap[accent] ?? accentMap.teal} />
        </span>
      )}

      <h3 className="mt-4 font-display text-lg font-extrabold tracking-tight text-ink">
        {title}
      </h3>
      {body && (
        <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      )}
      {children}

      {/* Corner + marker (visual only, CSS handles ::before) */}
      <span
        className="pointer-events-none absolute bottom-3 left-3 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-muted opacity-40 brutal:opacity-70"
        aria-hidden="true"
      >
        +
      </span>
    </article>
  );
}

/**
 * Grid wrapper for feature cards with exposed section architecture.
 */
export function BrutalFeatureGrid({ children, className }) {
  return (
    <div
      className={cx(
        'relative grid gap-px bg-ink/10 brutal:bg-ink sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {children}
    </div>
  );
}
