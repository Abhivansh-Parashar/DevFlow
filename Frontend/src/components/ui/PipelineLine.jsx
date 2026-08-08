import { cx } from '../../lib/utils';

const DOT_COLORS = {
  teal: 'var(--signal-teal)',
  amber: 'var(--signal-amber)',
  coral: 'var(--signal-coral)',
  violet: 'var(--signal-violet)',
  azure: 'var(--signal-azure)',
  muted: 'var(--text-muted)',
};

/**
 * PipelineLine — the signature "git graph trace".
 * variant="board": faint horizontal trace behind Kanban columns.
 * variant="timeline": vertical execution trace for activity feeds.
 * variant="landing" is handled by <PipelineSpine/> in /landing (GSAP-driven).
 */
export function PipelineLine({ variant = 'board', items = [], className }) {
  if (variant === 'board') {
    const positions = [10, 30, 50, 70, 90];
    return (
      <div className={cx('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
        <svg
          className="absolute left-0 right-0 top-1/2 h-[140px] w-full -translate-y-1/2"
          viewBox="0 0 1200 140"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M-20 70 C 120 70, 180 18, 300 18 S 460 122, 600 70 S 900 18, 1220 70"
            stroke="var(--signal-teal)"
            strokeOpacity="0.10"
            strokeWidth="1.5"
          />
          <path
            d="M-20 70 C 120 70, 180 18, 300 18 S 460 122, 600 70 S 900 18, 1220 70"
            stroke="url(#pipelineBoardGrad)"
            strokeOpacity="0.14"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="pipelineBoardGrad" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--signal-teal)" />
              <stop offset="0.5" stopColor="var(--signal-violet)" />
              <stop offset="1" stopColor="var(--signal-teal)" />
            </linearGradient>
          </defs>
        </svg>
        {positions.map((p, i) => (
          <span
            key={i}
            className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${p}%`,
              background: 'var(--signal-teal)',
              opacity: 0.3,
              boxShadow: '0 0 10px color-mix(in srgb, var(--signal-teal) 45%, transparent)',
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className={cx('relative pl-7', className)}>
        <div
          className="absolute bottom-3 left-[9px] top-3 w-[2px] rounded-full"
          style={{
            background:
              'linear-gradient(to bottom, color-mix(in srgb, var(--signal-teal) 55%, transparent), color-mix(in srgb, var(--signal-teal) 20%, transparent))',
          }}
        />
        {items.map((item, i) => (
          <div key={i} className="relative pb-6 last:pb-0">
            <span
              className="node-base absolute -left-7 top-1 grid h-[18px] w-[18px] place-items-center rounded-full"
            >
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{ background: DOT_COLORS[item.dot] ?? 'var(--signal-teal)' }}
              />
            </span>
            {item.children}
          </div>
        ))}
      </div>
    );
  }

  return null;
}
