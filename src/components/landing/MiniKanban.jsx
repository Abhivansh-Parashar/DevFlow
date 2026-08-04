import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const COLS = [
  { id: 'backlog', label: 'Backlog', color: 'var(--text-muted)' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--signal-amber)' },
  { id: 'done', label: 'Done', color: 'var(--signal-teal)' },
];

const STATIC = {
  backlog: [
    { key: 'DEV-101', title: 'Fix auth redirect loop', tag: 'bug', who: 'AT', color: 'var(--signal-coral)' },
    { key: 'DEV-105', title: 'Unify focus rings', tag: 'design', who: 'GH', color: 'var(--signal-amber)' },
    { key: 'DEV-108', title: 'Draft timeline spec', tag: 'spec', who: 'AL', color: 'var(--signal-teal)' },
  ],
  in_progress: [
    { key: 'DEV-107', title: 'Memoize board columns', tag: 'perf', who: 'LT', color: 'var(--signal-violet)' },
    { key: 'DEV-117', title: 'Wire search modal', tag: 'feature', who: 'AL', color: 'var(--signal-teal)' },
  ],
  done: [
    { key: 'DEV-099', title: 'Initial setup', tag: 'infra', done: true, who: 'LT', color: 'var(--signal-violet)' },
    { key: 'DEV-098', title: 'Docs site v1', tag: 'docs', done: true, who: 'GH', color: 'var(--signal-amber)' },
  ],
};

export function MiniKanban() {
  const [pos, setPos] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPos((p) => (p + 1) % 3), 2400);
    return () => clearInterval(t);
  }, []);

  const LIVE = { key: 'DEV-102', title: 'Build pipeline line' };

  return (
    <div className="grid grid-cols-3 gap-2.5 rounded-2xl border border-line bg-card-60 p-3 shadow-pop backdrop-blur-xl">
      {COLS.map((col, i) => {
        const isLive = pos === i;
        return (
          <div key={col.id} className="rounded-xl bg-canvas p-2.5">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: col.color }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">{col.label}</span>
            </div>
            <div className="space-y-2">
              {STATIC[col.id].map((c) => (
                <motion.div
                  key={c.key}
                  layout
                  transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  className="rounded-lg border border-line bg-card p-2.5"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-semibold text-teal">{c.key}</span>
                    {c.done && (
                      <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-teal text-[8px] font-bold text-white">✓</span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-ink">{c.title}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="rounded bg-raised px-1.5 py-0.5 font-mono text-[9px] text-muted">{c.tag}</span>
                    <span className="grid h-4 w-4 place-items-center rounded-full text-[7px] font-bold text-white" style={{ background: c.color }}>
                      {c.who}
                    </span>
                  </div>
                </motion.div>
              ))}
              {isLive && (
                <motion.div
                  layoutId="live-card"
                  layout
                  transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                  className="rounded-lg border bg-card p-2.5 shadow-glow"
                  style={{ borderColor: col.color }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-semibold text-teal">{LIVE.key}</span>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: col.color, boxShadow: `0 0 6px ${col.color}` }} />
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-ink">{LIVE.title}</p>
                  <span className="mt-1.5 inline-block rounded bg-raised px-1.5 py-0.5 font-mono text-[9px] text-muted">feature</span>
                </motion.div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
