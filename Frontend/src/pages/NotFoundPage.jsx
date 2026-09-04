import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Copy, Home, FolderKanban, Moon, BrickWall, MessageSquare } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Button, IconButton } from '../components/ui';
import { cx } from '../lib/utils';

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

const fadeUp = (delay = 0, reduce = false) => ({
  initial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
});

function BlinkDot({ color = 'var(--signal-coral)', size = 8 }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
        style={{ background: color }}
      />
      <span className="relative inline-flex rounded-full" style={{ width: size, height: size, background: color }} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero — giant glitchy "404" (theme-aware chromatic slices)          */
/* ------------------------------------------------------------------ */
function GlitchDigits() {
  return (
    <h1 aria-label="404" className="flex items-end gap-1 font-display font-bold tracking-tighter text-ink">
      {['4', '0', '4'].map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          data-text={ch}
          className={cx(
            'nf-digit nf-digit-flicker text-[clamp(5.5rem,17vw,10.5rem)] leading-[0.85]',
            i === 1 && 'translate-y-[0.08em]' // the middle digit slipped a little
          )}
          style={{ animationDelay: `${i * 0.6}s` }}
        >
          {ch}
        </span>
      ))}
    </h1>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene — the board right after DEV-404 fell off it                  */
/* ------------------------------------------------------------------ */

// The In Progress column's WIP counter, glitching as the drag dies.
const WIP_SEQ = ['1 / 1', '404 / 1', '0 / 1', '404 / 1', '1 / 1', '404 / 1', '1 / 1', '0 / 1', '1 / 1'];

// Faint skeleton rows so the column reads like a real board.
function GhostIssue({ bars = ['30%', '62%'] }) {
  return (
    <div aria-hidden="true" className="rounded-lg border border-line bg-card-60 px-2.5 py-2 opacity-50">
      <div className="space-y-1.5">
        {bars.map((w, i) => (
          <span
            key={i}
            className="block h-1.5 rounded-full"
            style={{ width: w, background: 'color-mix(in srgb, var(--text-muted) 45%, transparent)' }}
          />
        ))}
      </div>
    </div>
  );
}

function FallenIssueScene() {
  const reduce = useReducedMotion();
  const [wip, setWip] = useState(reduce ? '404 / 1' : '1 / 1');

  useEffect(() => {
    if (reduce) return undefined;
    let i = 0;
    const t = setInterval(() => {
      setWip(WIP_SEQ[i % WIP_SEQ.length]);
      i += 1;
    }, 820);
    return () => clearInterval(t);
  }, [reduce]);

  const glitching = wip === '404 / 1';
  const empty = wip === '0 / 1';
  const wipColor = glitching ? 'var(--signal-coral)' : empty ? 'var(--text-muted)' : 'var(--signal-teal)';

  return (
    <div className="relative mx-auto w-full max-w-[400px] select-none">
      {/* In Progress column — with the hole DEV-404 left behind */}
      <div className="card-surface rounded-2xl p-4 pb-7 shadow-soft">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: 'var(--signal-amber)' }} />
          <span className="text-sm font-semibold text-ink">In Progress</span>
          <span className="flex-1" />
          <span
            className={cx('rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums transition-colors', glitching && 'nf-blink')}
            style={{ color: wipColor, background: 'color-mix(in srgb, var(--surface-raised) 85%, transparent)' }}
            title="work in progress — it keeps losing count"
          >
            {wip}
          </span>
        </div>

        <div className="mt-3 space-y-2">
          <GhostIssue bars={['36%', '58%']} />
          {/* the empty slot where DEV-404 used to sit */}
          <div className="nf-hole flex h-12 flex-col items-center justify-center rounded-lg px-3">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-coral">DEV-404</p>
            <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-muted">was dragged out of this column</p>
          </div>
          <GhostIssue bars={['52%', '30%']} />
        </div>
      </div>

      {/* The fallen card, hanging off the board's edge */}
      <div className="nf-hang relative z-10 mx-auto -mt-6 w-[86%]">
        {/* connection-lost pill */}
        <div
          className="absolute -top-3 right-3 z-20 flex items-center gap-1.5 rounded-full border px-2 py-0.5"
          style={{
            borderColor: 'color-mix(in srgb, var(--signal-coral) 55%, transparent)',
            background: 'var(--surface-card)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <BlinkDot size={6} />
          <span className="font-mono text-[8.5px] font-bold uppercase tracking-[0.14em] text-coral">
            mid-drag · connection lost
          </span>
        </div>

        <div className="nf-jolt">
          <div className="nf-scan-wrap rounded-xl border shadow-pop" style={{ borderColor: 'color-mix(in srgb, var(--signal-coral) 40%, transparent)', background: 'var(--surface-card)' }}>
            <div className="px-3 pb-3 pt-3.5">
              <div className="flex items-center gap-2">
                <span className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-coral" style={{ background: 'color-mix(in srgb, var(--signal-coral) 12%, transparent)' }}>
                  DEV-404
                </span>
                <span className="flex-1" />
                <span className="font-mono text-[8.5px] font-medium uppercase tracking-[0.14em] text-muted">in-flight</span>
              </div>
              <p className="mt-2 text-[13px] font-semibold leading-snug text-ink">
                This page fell out of the board mid-drag
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">it never landed · still falling</p>

              <div className="mt-3 flex items-center gap-2 border-t pt-2" style={{ borderColor: 'color-mix(in srgb, var(--border-subtle) 75%, transparent)' }}>
                <span className="flex items-center gap-1 font-mono text-[10px] font-medium text-muted">
                  <MessageSquare size={11} />
                  404
                </span>
                <span className="flex-1" />
                <span
                  className="grid h-5 w-5 place-items-center rounded-full font-mono text-[9px] font-bold"
                  style={{
                    border: '1.5px dashed color-mix(in srgb, var(--text-muted) 60%, transparent)',
                    color: 'var(--text-muted)',
                  }}
                  title="assignee: ghost"
                >
                  ?
                </span>
              </div>
            </div>

            {/* scanline sweep */}
            <div className="nf-scan rounded-xl" />
          </div>
        </div>

        {/* shards trickling off the card */}
        <span className="nf-shard" style={{ left: '16%', top: '100%', animationDelay: '0.7s' }} />
        <span className="nf-shard" style={{ left: '68%', top: '100%', animationDelay: '3.1s' }} />
        <span className="nf-shard" style={{ left: '42%', top: '100%', animationDelay: '4.4s' }} />
      </div>

      {/* The destination slot that never received its card */}
      <div className="nf-slot mt-4 flex h-14 items-center justify-center gap-2.5 rounded-xl px-4">
        <BlinkDot size={7} />
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
          Done · waiting for a card that never lands…
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Copy + actions                                                     */
/* ------------------------------------------------------------------ */
function NotFoundBody() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const signedIn = useAppStore((s) => s.signedIn);
  const toast = useAppStore((s) => s.toast);
  const reduce = useReducedMotion();

  const copyPath = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast('success', 'URL copied — go find a human');
    } catch {
      toast('error', 'Could not copy — clipboard blocked');
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
      <motion.section {...fadeUp(0.05, reduce)} className="order-2 select-none lg:order-1">
        {/* status stamp */}
        <div className="flex items-center gap-2.5">
          <BlinkDot />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
            devflow · issue lost in transit
          </span>
        </div>

        <div className="mt-4">
          <GlitchDigits />
        </div>

        <h2 className="mt-4 font-display text-2xl font-bold text-ink md:text-3xl">
          DEV-404 fell off the board mid-drag.
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          Somebody was dragging it toward Done when the connection died. The card never landed — its
          column is still waiting, its slot is still empty, and every route that should lead somewhere
          now falls straight through to here.
        </p>

        {/* the path that broke */}
        <div className="mt-5 flex items-center gap-2">
          <span className="inline-flex max-w-full items-center gap-2 rounded-lg border border-line bg-card-60 px-3 py-1.5 font-mono text-xs text-muted">
            <span className="truncate">{pathname || '/'}</span>
          </span>
          <IconButton label="Copy this URL" icon={Copy} onClick={copyPath} />
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Button icon={FolderKanban} onClick={() => navigate(signedIn ? '/app/board' : '/login')}>
            {signedIn ? 'Back to the board' : 'Sign in & open your board'}
          </Button>
          <Button variant="outline" icon={Home} onClick={() => navigate('/')}>
            Go home
          </Button>
        </div>

        <p className="mt-9 max-w-md font-mono text-[11px] leading-relaxed text-muted">
          DEV-404 · reported by <span className="text-coral">@devflow-ghost</span> · assignee{' '}
          <span className="text-coral">unassigned</span> · comments{' '}
          <span className="text-coral">404</span> · priority{' '}
          <span className="text-coral">will-not-fix</span>
        </p>
      </motion.section>

      <motion.div {...fadeUp(0.15, reduce)} className="order-1 select-none lg:order-2">
        <FallenIssueScene />
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Minimal chrome for the standalone (top-level) page                 */
/* ------------------------------------------------------------------ */
function DevFlowMark({ size = 22 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0d9488" />
      <path
        d="M7 16h6l3-7 3 14 3-7h4"
        stroke="#ffffff"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="1.6" fill="#ffffff" />
    </svg>
  );
}

function ThemeToggleMini() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const next = theme === 'brutal' ? 'dark' : 'brutal';
  const Icon = theme === 'brutal' ? Moon : BrickWall;
  return (
    <motion.button
      onClick={toggleTheme}
      aria-label={`Switch to ${next} mode`}
      title={`Theme: ${theme} — click for ${next}`}
      className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink"
      whileTap={{ scale: 0.9 }}
    >
      <Icon size={17} />
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Page — renders in-shell (inside /app) or standalone                */
/* ------------------------------------------------------------------ */
export function NotFoundPage() {
  const { pathname } = useLocation();
  const inShell = pathname.startsWith('/app');
  const navigate = useNavigate();

  if (inShell) {
    return (
      <div className="flex h-[calc(100vh-56px)] select-none flex-col overflow-y-auto">
        <div className="m-auto w-full">
          <NotFoundBody />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] select-none flex-col">
      {/* top chrome — logo + theme toggle */}
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-5 pt-5">
        <button
          onClick={() => navigate('/')}
          className="focus-ring flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-80"
          aria-label="DevFlow home"
        >
          <DevFlowMark />
          <span className="font-display text-[15px] font-bold tracking-tight text-ink">DevFlow</span>
        </button>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">tracker</span>
        <div className="flex-1" />
        <ThemeToggleMini />
      </div>

      <main className="flex flex-1 flex-col">
        <div className="m-auto w-full">
          <NotFoundBody />
        </div>
      </main>

      <footer className="pb-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted opacity-70">
        devflow · DEV-404 · priority: will-not-fix · still falling
      </footer>
    </div>
  );
}
