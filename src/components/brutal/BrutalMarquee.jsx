import { ArrowRight } from 'lucide-react';
import { cx } from '../../lib/utils';

const DEFAULT_ITEMS = [
  'Backlog', 'Todo', 'In Progress', 'Review', 'Done',
  'Workspace Isolation', 'GitHub Auto-Link', 'Mentions & Stickers',
];

/**
 * Continuous-scroll marquee ticker with hard 2px borders.
 * Soft Brutalist kinetic element for secondary text / feature lists.
 */
export function BrutalMarquee({ items = DEFAULT_ITEMS, className, speed = 32 }) {
  return (
    <div
      className={cx('sb-marquee brutal-ticker py-3.5', className)}
      aria-label="Feature ticker"
    >
      <div className="overflow-hidden">
        <div
          className="sb-marquee-track marquee-track flex w-max items-center gap-10 whitespace-nowrap"
          style={{ animationDuration: `${speed}s` }}
        >
          {[0, 1].map((k) => (
            <div key={k} className="flex items-center gap-10" aria-hidden={k === 1}>
              {items.map((label, i) => (
                <span key={i} className="flex items-center gap-10">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                    {label}
                  </span>
                  <ArrowRight size={12} className="text-ink opacity-30" strokeWidth={2.5} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Floating feedback badge — asymmetrical stamp with mint pastel accent.
 */
export function BrutalFeedbackBadge({ label = 'Live · v2.4', className, style }) {
  return (
    <div
      className={cx('sb-feedback-badge pointer-events-auto select-none', className)}
      style={style}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}
