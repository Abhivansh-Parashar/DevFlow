import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import { Button } from '../ui';
import { MiniKanban } from '../landing/MiniKanban';
import { BrutalFeedbackBadge } from './BrutalMarquee';
import { cx } from '../../lib/utils';

gsap.registerPlugin(ScrollToPlugin);

const EASE = [0.16, 1, 0.3, 1];

function RevealLine({ text, className = '', delay = 0 }) {
  const words = text.split(' ');
  return (
    <span className={cx('block', className)}>
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: '0.14em', marginBottom: '-0.14em' }}
        >
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

const FEATURES = [
  'Workspace isolation',
  'GitHub auto-linking',
  'Mentions & stickers',
];

/**
 * Soft Brutalist Hero — blueprint grid, metadata stamps, sharp CTAs, dot-matrix texture.
 */
export function BrutalHero({ className }) {
  const scrollTo = (e, href) => {
    e.preventDefault();
    gsap.to(window, { scrollTo: { y: href, offsetY: 80 }, duration: 0.9, ease: 'power3.inOut' });
  };

  return (
    <section
      id="top"
      className={cx(
        'sb-hero sb-blueprint relative flex min-h-screen items-center overflow-hidden px-5 pt-16',
        className,
      )}
    >
      {/* Structural backdrop layers */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="bg-grid absolute inset-0 opacity-60" />
        <div className="sb-dot-matrix absolute inset-0 opacity-30" />
        {/* Hairline section dividers */}
        <div className="absolute inset-y-0 left-[max(1.25rem,calc(50%-36rem))] w-px bg-ink/10 brutal:bg-ink" />
        <div className="absolute inset-y-0 right-[max(1.25rem,calc(50%-36rem))] w-px bg-ink/10 brutal:bg-ink" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-2">
        {/* Copy column */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* Metadata stamp */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="brutal-stamp sb-stamp">
              <span className="sb-status-dot square pulse text-teal" aria-hidden="true" />
              DEV-001 · pipeline active
            </span>
          </motion.div>

          {/* Display heading — weight 900, tight tracking */}
          <h1 className="mt-6 font-display text-[44px] font-black leading-[0.98] tracking-[-0.04em] text-ink sm:text-6xl">
            <RevealLine text="Every issue has a path." />
            <RevealLine text="Watch yours move." className="text-teal" delay={0.32} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.55, ease: EASE }}
            className="mt-5 max-w-xl rounded-xl border border-line bg-card-60 px-4 py-3 text-[17px] leading-relaxed text-ink shadow-soft"
          >
            Workspaces keep companies apart, projects keep teams in sync. Every issue — from
            Backlog to Done — carries its commits, comments and context along a live pipeline.
          </motion.p>

          {/* Sharp CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.7, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/register">
              <Button size="lg" iconRight={ArrowRight} className="sb-tilt rounded-none brutal:rounded-none">
                Start Free
              </Button>
            </Link>
            <a
              href="#pipeline"
              className="focus-ring"
              onClick={(e) => scrollTo(e, '#pipeline')}
            >
              <Button size="lg" variant="secondary" className="sb-tilt-right btn-secondary-brutal rounded-none">
                Explore Pipeline
              </Button>
            </a>
          </motion.div>

          {/* Structured feature list with square dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2"
          >
            {FEATURES.map((f) => (
              <span key={f} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                <span className="sb-status-dot square text-teal" aria-hidden="true" />
                {f}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Visual column — kanban with offset block */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
          className="relative"
        >
          <div className="brutal-block absolute -inset-8" aria-hidden="true" />
          <BrutalFeedbackBadge
            label="Interactive demo"
            className="-right-2 -top-4 sm:right-0"
          />
          <div className="relative sb-crosshair" data-coord="01.0">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <MiniKanban />
            </motion.div>
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              DEV-102 is moving · drag it anywhere
            </p>
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-muted">
        <span className="sb-index text-[10px]">scroll</span>
        <ChevronDown size={16} className="animate-[scroll-hint_1.6s_ease-in-out_infinite] text-teal" />
      </div>
    </section>
  );
}
