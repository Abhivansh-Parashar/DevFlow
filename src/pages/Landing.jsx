import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import {
  ArrowRight, GitCommit, MessageSquare, Sparkles, BarChart3,
  Building2, Sun, Moon, Check, ChevronDown, Mail,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui';
import { PipelineRail } from '../components/landing/PipelineRail';
import { MiniKanban } from '../components/landing/MiniKanban';
import { cx } from '../lib/utils';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const EASE = [0.16, 1, 0.3, 1];

/* ---------------------------------- Nav ---------------------------------- */
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    gsap.to(window, { scrollTo: { y: href, offsetY: 80 }, duration: 0.9, ease: 'power3.inOut' });
  };

  return (
    <header className={cx('fixed inset-x-0 top-0 z-40 transition-all duration-300', scrolled ? 'glass-nav' : 'bg-transparent')}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <a href="#top" onClick={(e) => go(e, '#top')} className="focus-ring flex items-center gap-2 rounded-lg">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-card">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h5l2.5-6 3 12 2.5-6H21" />
            </svg>
          </span>
          <span className="font-display text-lg font-bold text-ink">DevFlow</span>
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {[
            ['#pipeline', 'Pipeline'],
            ['#features', 'Features'],
            ['#metrics', 'Metrics'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={(e) => go(e, href)}
              className="focus-ring rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex-1" />
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink"
        >
          {theme === 'light' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
        <Link to="/register"><Button size="sm">Start Free</Button></Link>
      </div>
    </header>
  );
}

/* ------------------------------ Scroll progress ------------------------------ */
function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
      });
    });
    return () => ctx.revert();
  }, []);
  return (
    <div
      ref={ref}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left scale-x-0"
      style={{ background: 'linear-gradient(90deg, var(--signal-teal), var(--signal-violet))' }}
      aria-hidden="true"
    />
  );
}

/* ---------------------------------- Hero ---------------------------------- */
function RevealLine({ text, className = '', delay = 0 }) {
  const words = text.split(' ');
  return (
    <span className={cx('block', className)}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" style={{ paddingBottom: '0.14em', marginBottom: '-0.14em' }}>
          <motion.span
            className="inline-block"
            initial={{ y: '115%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, delay: delay + i * 0.06, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function Hero() {
  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden px-5 pt-16">
      {/* Backdrop: grid + floating orbs */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="bg-grid absolute inset-0" />
        <div
          className="orb orb-a absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full"
          style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--signal-teal) 13%, transparent), transparent 70%)' }}
        />
        <div
          className="orb orb-b absolute -right-24 top-1/3 h-[24rem] w-[24rem] rounded-full"
          style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--signal-violet) 11%, transparent), transparent 70%)' }}
        />
        <div
          className="orb orb-c absolute -bottom-28 left-1/3 h-[22rem] w-[22rem] rounded-full"
          style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--signal-azure) 9%, transparent), transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-mono text-xs uppercase tracking-[0.22em] text-teal"
          >
            <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-teal align-middle" />
            DEV-001 · pipeline active
          </motion.p>
          <h1 className="mt-5 font-display text-[44px] font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            <RevealLine text="Every issue has a path." />
            <RevealLine text="Watch yours move." className="text-teal" delay={0.32} />
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.55, ease: EASE }}
            className="mt-5 max-w-md text-[17px] leading-relaxed text-muted"
          >
            Workspaces keep companies apart, projects keep teams in sync. Every issue — from
            Backlog to Done — carries its commits, comments and context along a live pipeline,
            while your team ships faster with mentions, stickers and one-tap invites.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.7, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/register"><Button size="lg" iconRight={ArrowRight}>Start Free</Button></Link>
            <a href="#pipeline" className="focus-ring rounded-lg" onClick={(e) => { e.preventDefault(); gsap.to(window, { scrollTo: { y: '#pipeline', offsetY: 80 }, duration: 0.9, ease: 'power3.inOut' }); }}>
              <Button size="lg" variant="secondary">Explore Pipeline</Button>
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted"
          >
            {['Workspace isolation', 'GitHub auto-linking', 'Mentions & stickers'].map((f) => (
              <span key={f} className="flex items-center gap-1.5">
                <Check size={13} className="text-teal" /> {f}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
          className="relative"
        >
          <div
            className="absolute -inset-10 rounded-[2.5rem]"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(58% 55% at 50% 42%, color-mix(in srgb, var(--signal-teal) 11%, transparent), transparent 72%), radial-gradient(40% 40% at 82% 16%, color-mix(in srgb, var(--signal-violet) 9%, transparent), transparent 70%)',
            }}
          />
          <div className="relative">
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <MiniKanban />
            </motion.div>
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              DEV-102 is moving · drag it anywhere
            </p>
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-muted">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]">scroll</span>
        <ChevronDown size={16} className="animate-[scroll-hint_1.6s_ease-in-out_infinite] text-teal" />
      </div>
    </section>
  );
}

/* ---------------------------------- Ticker ---------------------------------- */
const TICKER = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];

function Ticker() {
  return (
    <div className="relative border-y border-line bg-card-60 py-3.5 backdrop-blur-sm">
      <div className="overflow-hidden">
        <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap">
          {[0, 1].map((k) => (
            <div key={k} className="flex items-center gap-8" aria-hidden={k === 1}>
              {TICKER.map((s, i) => (
                <span key={i} className="flex items-center gap-8">
                  <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-muted">{s}</span>
                  <ArrowRight size={13} className="text-teal opacity-50" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Walkthrough ---------------------------------- */
const STAGES = [
  {
    id: 'backlog', label: 'Backlog', color: 'var(--text-muted)',
    title: 'Issues land in the backlog',
    body: 'Every feature, bug and idea enters with a ticket ID, a priority and an owner. AI-generated drafts drop in alongside the rest.',
    snippet: (
      <div className="space-y-2.5">
        {[
          { key: 'DEV-101', title: 'Fix auth redirect loop', tag: 'bug', prio: 'high' },
          { key: 'DEV-105', title: 'Unify focus rings', tag: 'design', prio: 'low' },
          { key: 'DEV-108', title: 'Draft timeline spec', tag: 'spec', prio: 'low' },
        ].map((c) => (
          <div key={c.key} className="rounded-xl border border-line bg-card p-3 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-teal">{c.key}</span>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: c.prio === 'high' ? 'var(--signal-coral)' : 'var(--signal-teal)', background: 'color-mix(in srgb, var(--signal-coral) 10%, transparent)' }}>
                {c.prio}
              </span>
            </div>
            <p className="mt-1 text-[13px] font-medium text-ink">{c.title}</p>
            <span className="mt-1.5 inline-block rounded bg-raised px-1.5 py-0.5 font-mono text-[10px] text-muted">{c.tag}</span>
          </div>
        ))}
        <div className="flex items-center gap-2.5 rounded-xl border border-violet-soft fill-violet-soft p-3">
          <Sparkles size={14} className="text-violet" />
          <div>
            <p className="text-[12px] font-semibold text-violet">“Add retry logic to webhook deliveries…”</p>
            <p className="text-[11px] text-muted">AI draft · waiting for your confirm</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'todo', label: 'Todo', color: 'var(--signal-azure)',
    title: 'Queued for the sprint',
    body: 'Tickets get assignees and priorities. The board re-scopes to the active workspace and project — nothing global, ever.',
    snippet: (
      <div className="space-y-2.5">
        {[
          { key: 'DEV-104', title: 'Add team chat', who: 'LT' },
          { key: 'DEV-106', title: 'Migrate icon set', who: 'GH' },
          { key: 'DEV-109', title: 'Wire search modal', who: 'AL' },
        ].map((c) => (
          <div key={c.key} className="flex items-center gap-3 rounded-xl border border-line bg-card p-3 shadow-soft">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-[10px] font-bold text-white" style={{ background: c.who === 'LT' ? 'var(--signal-violet)' : c.who === 'GH' ? 'var(--signal-amber)' : 'var(--signal-teal)' }}>
              {c.who}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-semibold text-teal">{c.key}</p>
              <p className="truncate text-[13px] font-medium text-ink">{c.title}</p>
            </div>
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--signal-azure)' }} />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'in_progress', label: 'In Progress', color: 'var(--signal-amber)',
    title: 'Commits auto-link',
    body: 'Push to a branch and the matching commits attach themselves to the ticket — hashes rendered in JetBrains Mono, tied to the trace.',
    snippet: (
      <div className="rounded-xl border border-line bg-card p-3 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold text-teal">DEV-102</span>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: 'var(--signal-amber)', background: 'color-mix(in srgb, var(--signal-amber) 13%, transparent)' }}>
            In Progress
          </span>
        </div>
        <p className="mt-1 text-[13px] font-semibold text-ink">Build pipeline line</p>
        <div className="mt-2.5 space-y-1.5">
          {[
            { sha: 'd6a7b8c', msg: 'feat: pipeline spine with ScrollTrigger scrub', branch: 'feat/pipeline-line' },
            { sha: 'e7b8c9d', msg: 'feat: node glow + reduced-motion fallback', branch: 'feat/pipeline-line' },
            { sha: 'f8c9d0e', msg: 'feat: stage sync + progress bar', branch: 'feat/pipeline-line' },
          ].map((c) => (
            <div key={c.sha} className="flex items-center gap-2 rounded-lg bg-raised px-2.5 py-1.5">
              <GitCommit size={12} className="shrink-0 text-teal" />
              <code className="font-mono text-[11px] font-semibold text-teal">{c.sha}</code>
              <span className="truncate text-[11px] text-muted">{c.msg}</span>
              <span className="ml-auto shrink-0 font-mono text-[10px] text-muted">{c.branch}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'review', label: 'Review', color: 'var(--signal-violet)',
    title: 'Threads around the change',
    body: 'Comments and replies trace alongside the status moves, so the why of a change is never lost.',
    snippet: (
      <div className="space-y-2.5">
        <div className="rounded-xl border border-line bg-card p-3 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: 'var(--signal-amber)' }}>GH</span>
            <span className="text-[12px] font-semibold text-ink">Grace Hopper</span>
            <span className="font-mono text-[10px] text-muted">2h ago</span>
          </div>
          <p className="mt-1.5 text-[12px] text-muted">@ada can you sanity-check the amber contrast on raised?</p>
        </div>
        <div className="ml-5 rounded-xl border border-line bg-card p-3 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: 'var(--signal-teal)' }}>AL</span>
            <span className="text-[12px] font-semibold text-ink">Ada Lovelace</span>
            <span className="font-mono text-[10px] text-muted">1h ago</span>
          </div>
          <p className="mt-1.5 text-[12px] text-muted">Amber hits AA on raised. Approved pending the hover state.</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pl-1">
          {[['🚀', 3], ['👍', 2], ['❤️', 1]].map(([e, n]) => (
            <span key={e} className="flex items-center gap-1 rounded-full border border-line bg-card px-1.5 py-0.5 text-[11px] shadow-soft">
              {e} <span className="font-mono text-[9px] text-muted">{n}</span>
            </span>
          ))}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ color: 'var(--signal-violet)', background: 'color-mix(in srgb, var(--signal-violet) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--signal-violet) 36%, transparent)' }}>
          <MessageSquare size={11} /> 2 replies · Review
        </span>
      </div>
    ),
  },
  {
    id: 'done', label: 'Done', color: 'var(--signal-teal)',
    title: 'Ships with a trace',
    body: 'The full journey stays on the activity timeline — every status move, commit and comment, in order.',
    snippet: (
      <div className="rounded-xl border border-line bg-card p-3 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold text-teal">DEV-099</span>
          <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: 'var(--signal-teal)', background: 'color-mix(in srgb, var(--signal-teal) 11%, transparent)' }}>
            <Check size={10} /> Done
          </span>
        </div>
        <p className="mt-1 text-[13px] font-semibold text-ink">Initial setup</p>
        <div className="mt-3 flex items-center gap-1.5">
          {['backlog', 'todo', 'in_progress', 'review', 'done'].map((s, i) => (
            <div key={s} className="flex flex-1 flex-col items-center gap-1">
              <div className="h-1.5 w-full rounded-full" style={{ background: i < 4 ? 'var(--surface-raised)' : 'var(--signal-teal)' }}>
                {i < 4 && <div className="h-full w-full rounded-full" style={{ background: 'color-mix(in srgb, var(--signal-teal) 45%, transparent)' }} />}
              </div>
              <span className={cx('h-1.5 w-1.5 rounded-full', i === 4 && 'bg-teal')} style={i < 4 ? { background: 'var(--border-subtle)' } : { boxShadow: '0 0 6px var(--signal-teal)' }} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-raised px-2.5 py-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">cycle time</span>
          <span className="font-mono text-[12px] font-bold text-teal">1.4 days</span>
        </div>
      </div>
    ),
  },
];

function StageCopy({ s, index }) {
  return (
    <div>
      <span className="font-mono text-5xl font-bold" style={{ color: 'color-mix(in srgb, var(--text-primary) 16%, transparent)' }}>0{index + 1}</span>
      <div className="mt-2 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} />
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: s.color }}>{s.label}</span>
      </div>
      <h3 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">{s.title}</h3>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">{s.body}</p>
    </div>
  );
}

function Walkthrough() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const reduced = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(true);
  const [stageLabel, setStageLabel] = useState('Start');

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reduced || !isDesktop) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray('[data-stage-panel]');
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
            const idx = Math.min(panels.length - 1, Math.max(0, Math.round(self.progress * (panels.length - 1))));
            const label = idx === 0 ? 'Start' : idx === panels.length - 1 ? 'Shipped ✓' : STAGES[idx - 1].label;
            setStageLabel((prev) => (prev === label ? prev : label));
          },
        },
      });

      panels.forEach((panel) => {
        gsap.fromTo(
          panel,
          { scale: 0.9, opacity: 0.45 },
          {
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: 'left 82%',
              end: 'left 52%',
              scrub: true,
            },
          }
        );
      });
    }, section);
    return () => ctx.revert();
  }, [reduced, isDesktop]);

  // Mobile / reduced-motion fallback: natural scroll with staged reveals.
  if (reduced || !isDesktop) {
    return (
      <section id="pipeline" className="relative px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow="the pipeline" title="Five stages. One trace." sub="Every ticket moves through the same honest pipeline." />
          <div className="mt-12 space-y-10">
            {STAGES.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, ease: EASE }}
                className="grid items-center gap-8 lg:grid-cols-2"
              >
                <StageCopy s={s} index={i} />
                <div className="rounded-2xl border border-line bg-card-60 p-5 shadow-soft backdrop-blur-xl">{s.snippet}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pipeline" ref={sectionRef} className="relative h-screen overflow-hidden">
      {/* Header row */}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-20 flex items-center justify-between px-6 sm:px-10">
        <p className="mono-label">The pipeline</p>
        <p className="mono-label">stage · <span className="text-teal">{stageLabel}</span></p>
      </div>

      {/* Horizontal track */}
      <div
        ref={trackRef}
        className="flex h-full items-center gap-4 px-[6vw] will-change-transform"
      >
        {/* Intro panel */}
        <div data-stage-panel className="w-[min(380px,78vw)] shrink-0 p-4 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-teal">DEV-002 · pipeline walkthrough</p>
          <h3 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink">Five stages. One trace.</h3>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Keep scrolling — the pipeline carries this ticket from Backlog to Done, and the page moves with it.
          </p>
          <div className="mt-6 flex items-center gap-2 text-muted">
            <ArrowRight size={14} className="text-teal" />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em]">scroll →</span>
          </div>
        </div>

        {STAGES.map((s, i) => (
          <div
            key={s.id}
            data-stage-panel
            className="grid w-[min(600px,84vw)] shrink-0 items-center gap-6 rounded-3xl border border-line bg-card-60 p-6 shadow-soft backdrop-blur-xl sm:grid-cols-2 sm:p-8"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-5xl font-bold" style={{ color: 'color-mix(in srgb, var(--text-primary) 14%, transparent)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} />
              </div>
              <span className="mt-3 inline-block font-mono text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: s.color }}>{s.label}</span>
              <h4 className="mt-2 font-display text-2xl font-bold leading-snug text-ink">{s.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
            <div className="max-h-[52vh] overflow-y-auto">{s.snippet}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-line bg-card-60 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <span className="mono-label shrink-0">progress</span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-raised">
            <div
              ref={barRef}
              className="h-full w-full origin-left scale-x-0 rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--signal-teal), var(--signal-violet))' }}
            />
          </div>
          <span className="mono-label shrink-0">Done ✓</span>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Features ---------------------------------- */
const FEATURES = [
  { icon: Building2, title: 'Workspace scoping', body: 'Nothing is global except the switcher. Projects, members, chat and analytics all re-scope the instant you switch.', accent: 'teal' },
  { icon: GitCommit, title: 'GitHub auto-linking', body: 'Commits and PRs attach themselves to issues with hash chips and branch context — the trace stays honest.', accent: 'amber' },
  { icon: MessageSquare, title: 'Chat with mentions & stickers', body: 'Realtime group chat with @mentions that ping the right person, sticker reactions for the wins, and code blocks that format themselves.', accent: 'violet' },
  { icon: Sparkles, title: 'AI issue generation', body: 'Describe the work in plain language. Review a structured draft — labels, priority, acceptance criteria — then confirm.', accent: 'violet' },
  { icon: BarChart3, title: 'Project health analytics', body: 'Velocity, distribution and cycle time, styled to the theme and scoped to the project.', accent: 'teal' },
  { icon: Mail, title: 'Project invites', body: 'Invite teammates with a card — accept with a swipe and land straight inside the project. Declines swoop away, no hard feelings.', accent: 'azure' },
];

function SpotlightCard({ children }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="spotlight-card glass-popover group h-full rounded-2xl p-6 transition-transform duration-300 ease-out hover:-translate-y-1.5"
    >
      {children}
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="relative px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <SectionHeading eyebrow="features" title="Built like developer tooling" sub="Terminal-honest surfaces, git-graph signal colors, and a pipeline that never lies." />
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: EASE }}
            >
              <SpotlightCard>
                <span className={cx('grid h-11 w-11 place-items-center rounded-xl', f.accent === 'violet' ? 'fill-violet-soft text-violet' : f.accent === 'amber' ? 'fill-amber-soft text-amber' : f.accent === 'azure' ? 'fill-azure-soft text-azure' : 'fill-teal-soft text-teal')}>
                  <f.icon size={19} strokeWidth={2} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Chat showcase ------------------------------ */
function ChatShowcase() {
  return (
    <section id="chat" className="relative px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <SectionHeading
              eyebrow="team chat"
              title="Talk like a group chat."
              sub="Mentions that ping the right person, stickers for the wins, reactions for the small moments that keep a team moving."
            />
            <ul className="mt-7 space-y-3">
              {[
                ['@mentions', 'Type @ and pick a teammate — their name turns into a teal chip and they get pinged.'],
                ['Sticker pack', 'Ship it, party it, coffee-break it. Stickers render on vibrant tiles — no image uploads needed.'],
                ['Reactions', 'Hover any message and react with one tap. A low-friction “+1” for the board.'],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start gap-3 rounded-xl border border-line bg-card p-4 shadow-soft transition-transform duration-300 hover:-translate-y-0.5">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg fill-teal-soft text-teal">
                    <Check size={15} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{t}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative"
          >
            <div
              className="absolute -inset-8 rounded-[2.5rem]"
              aria-hidden="true"
              style={{ background: 'radial-gradient(50% 55% at 30% 30%, color-mix(in srgb, var(--signal-violet) 12%, transparent), transparent 70%)' }}
            />
            <div className="relative overflow-hidden rounded-2xl border border-line bg-card-60 shadow-pop backdrop-blur-xl">
              {/* window header */}
              <div className="flex items-center gap-2.5 border-b border-line bg-card-60 px-4 py-3">
                <span className="grid h-7 w-7 place-items-center rounded-lg fill-violet-soft text-violet">
                  <MessageSquare size={13} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-ink">#frontend</p>
                  <p className="text-[10px] text-muted">4 online · mentions & stickers</p>
                </div>
                <div className="flex-1" />
                {[
                  { i: 'GH', c: 'var(--signal-amber)' },
                  { i: 'LT', c: 'var(--signal-violet)' },
                  { i: 'AL', c: 'var(--signal-teal)' },
                ].map((a) => (
                  <span key={a.i} className="grid h-6 w-6 place-items-center rounded-full text-[9px] font-bold text-white ring-2 ring-card" style={{ background: a.c }}>
                    {a.i}
                  </span>
                ))}
              </div>

              <div className="space-y-5 px-4 py-5">
                {/* mention message */}
                <div className="flex items-start gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: 'var(--signal-amber)' }}>GH</span>
                  <div>
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="text-[12px] font-semibold text-ink">Grace Hopper</span>
                      <span className="font-mono text-[10px] text-muted">2h ago</span>
                    </div>
                    <div className="rounded-2xl rounded-tl-sm border border-line bg-card px-3.5 py-2.5 text-[12.5px] text-ink">
                      Dark tokens are ready — <span className="mention-chip">@Ada</span> can you check the contrast?
                    </div>
                  </div>
                </div>

                {/* sticker message */}
                <div className="flex items-start gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: 'var(--signal-violet)' }}>LT</span>
                  <div>
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="text-[12px] font-semibold text-ink">Linus Torvalds</span>
                      <span className="font-mono text-[10px] text-muted">1h ago</span>
                    </div>
                    <div className="inline-block pt-0.5">
                      <div className="grid h-16 w-16 place-items-center rounded-2xl text-[34px] shadow-soft" style={{ background: 'linear-gradient(135deg, #0d9488, #2563eb)' }}>
                        🚀
                      </div>
                    </div>
                  </div>
                </div>

                {/* my message + reactions */}
                <div className="flex flex-row-reverse items-start gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: 'var(--signal-teal)' }}>AL</span>
                  <div className="text-right">
                    <div className="mb-1 flex flex-row-reverse items-baseline gap-2">
                      <span className="text-[12px] font-semibold text-ink">You</span>
                      <span className="font-mono text-[10px] text-muted">now</span>
                    </div>
                    <div className="inline-block rounded-2xl rounded-tr-sm border border-teal bg-teal px-3.5 py-2.5 text-[12.5px] text-white dark:text-[#04120E]">
                      Shipping tonight 🎉
                    </div>
                    <div className="mt-1.5 flex flex-row-reverse items-center gap-1.5">
                      {[['❤️', 4], ['🚀', 2]].map(([e, n]) => (
                        <span key={e} className="flex items-center gap-1 rounded-full border border-line bg-card px-2 py-0.5 text-[11px] shadow-soft">
                          {e} <span className="font-mono text-[9px] text-muted">{n}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* typing indicator */}
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: 'var(--signal-azure)' }}>KT</span>
                  <span className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-line bg-card px-3 py-2 text-[11px] text-muted">
                    <span className="flex gap-1">{[0, 1, 2].map((i) => (
                      <span key={i} className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-teal" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}</span>
                    Katherine typing…
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Metrics ---------------------------------- */
function useCountUp(target, decimals = 0) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const dur = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return [ref, value.toFixed(decimals)];
}

function MetricsBand() {
  const [ref1, close] = useCountUp(1.4, 1);
  const [ref2, commits] = useCountUp(142, 0);
  const [ref3, uptime] = useCountUp(99.99, 2);
  return (
    <section id="metrics" className="relative px-5 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mx-auto max-w-5xl rounded-2xl border border-line bg-card-60 p-8 shadow-soft backdrop-blur-xl sm:p-10"
      >
        <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
          <div ref={ref1}>
            <p className="font-mono text-4xl font-bold text-teal sm:text-5xl">{close}<span className="text-lg text-muted"> days</span></p>
            <p className="mt-2 text-xs uppercase tracking-wider text-muted">avg time to close</p>
          </div>
          <div ref={ref2}>
            <p className="font-mono text-4xl font-bold text-ink sm:text-5xl">{commits}k<span className="text-lg text-muted">+</span></p>
            <p className="mt-2 text-xs uppercase tracking-wider text-muted">commits linked</p>
          </div>
          <div ref={ref3}>
            <p className="font-mono text-4xl font-bold text-violet sm:text-5xl">{uptime}<span className="text-lg text-muted">%</span></p>
            <p className="mt-2 text-xs uppercase tracking-wider text-muted">pipeline uptime</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------- Final CTA ---------------------------------- */
function FinalCTA() {
  return (
    <section id="cta" className="relative overflow-hidden px-5 py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="orb orb-b h-96 w-96 rounded-full" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--signal-teal) 10%, transparent), transparent 70%)' }} />
        </div>
        <div className="absolute right-1/4 top-1/3 -translate-y-1/2">
          <div className="orb orb-c h-80 w-80 rounded-full" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--signal-violet) 9%, transparent), transparent 70%)' }} />
        </div>
      </div>
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative mx-auto mb-8 grid h-16 w-16 place-items-center"
        >
          <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-teal" />
          <span className="node-base node-lit grid h-12 w-12 place-items-center rounded-full">
            <Check size={20} className="text-card" />
          </span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="font-mono text-xs uppercase tracking-[0.22em] text-teal"
        >
          DEV-001 · pipeline complete
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
          className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl"
        >
          Every issue has a path.<span className="block text-teal">Start yours.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.26, ease: EASE }}
          className="mx-auto mt-4 max-w-md text-muted"
        >
          Workspaces, projects, and one honest pipeline between them. Free for small teams.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.34, ease: EASE }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/register"><Button size="lg" iconRight={ArrowRight}>Start Free</Button></Link>
          <Link to="/login"><Button size="lg" variant="secondary">Open the app</Button></Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------- Footer ---------------------------------- */
function Footer() {
  const cols = [
    { h: 'Product', links: ['Pipeline', 'Board', 'Chat', 'Analytics'] },
    { h: 'Workspaces', links: ['Switch', 'Roles', 'Members', 'Create'] },
    { h: 'Projects', links: ['Scoping', 'Keys', 'Health', 'AI drafts'] },
    { h: 'Resources', links: ['Docs', 'Changelog', 'Status', 'Contact'] },
  ];
  return (
    <footer className="border-t border-line px-5 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-card">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h5l2.5-6 3 12 2.5-6H21" />
              </svg>
            </span>
            <span className="font-display text-base font-bold text-ink">DevFlow</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">Built for workspaces, not boards alone. Multi-tenant issue tracking with a pipeline that traces every ticket home.</p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">© 2026 DevFlow · status: pipeline healthy</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <p className="mono-label">{c.h}</p>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#top" className="focus-ring rounded text-sm text-muted transition-colors hover:text-ink">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}

function SectionHeading({ eyebrow, title, sub }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-teal">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-[36px]">{title}</h2>
      {sub && <p className="mx-auto mt-3 max-w-lg text-muted">{sub}</p>}
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */
export function Landing() {
  return (
    <div className="relative">
      <ScrollProgress />
      <LandingNav />
      <PipelineRail />
      <div className="relative">
        <Hero />
        <Ticker />
        <Walkthrough />
        <Features />
        <ChatShowcase />
        <MetricsBand />
        <FinalCTA />
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
