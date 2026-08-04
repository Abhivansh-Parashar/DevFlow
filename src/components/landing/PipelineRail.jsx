import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SECTIONS = [
  { id: 'top', label: 'Hero' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'features', label: 'Features' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'cta', label: 'Start' },
];

/**
 * PipelineRail — the landing page's scroll-progress "pipeline trace".
 * A fixed vertical line on the left fills as the page scrolls, with a glowing
 * head dot and section nodes that light up as they enter the viewport.
 * Desktop only (hidden on small screens).
 */
export function PipelineRail() {
  const fillRef = useRef(null);
  const headRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fill the rail and slide the glow head along it, both scrubbed together.
      const st = { start: 0, end: 'max', scrub: 0.4 };
      gsap.to(fillRef.current, { scaleY: 1, ease: 'none', scrollTrigger: { ...st } });
      gsap.to(headRef.current, { top: '100%', opacity: 1, ease: 'none', scrollTrigger: { ...st } });
      SECTIONS.forEach((s) => {
        const el = document.getElementById(`rail-${s.id}`);
        if (!el) return;
        gsap.to(el, {
          scrollTrigger: {
            trigger: `#${s.id}`,
            start: 'top 62%',
            end: 'top 34%',
            onToggle: (self) => el.classList.toggle('rail-lit', self.isActive),
          },
        });
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="fixed bottom-10 left-6 top-24 z-20 hidden lg:block" aria-hidden="true">
      <div className="relative h-full w-px">
        {/* Base track */}
        <div
          className="absolute inset-y-0 left-0 w-px"
          style={{ background: 'color-mix(in srgb, var(--border-subtle) 55%, transparent)' }}
        />
        {/* Filled progress */}
        <div
          ref={fillRef}
          className="absolute inset-y-0 left-0 w-px origin-top scale-y-0"
          style={{
            background: 'linear-gradient(to bottom, var(--signal-teal), var(--signal-violet))',
            boxShadow: '0 0 10px color-mix(in srgb, var(--signal-teal) 60%, transparent)',
          }}
        />
        {/* Glow head */}
        <span
          ref={headRef}
          className="absolute left-[-3px] top-0 h-2 w-2 rounded-full opacity-0"
          style={{
            background: 'var(--signal-teal)',
            boxShadow: '0 0 0 4px color-mix(in srgb, var(--signal-teal) 18%, transparent), 0 0 12px color-mix(in srgb, var(--signal-teal) 70%, transparent)',
          }}
        />
        {/* Section nodes */}
        {SECTIONS.map((s, i) => (
          <span
            key={s.id}
            id={`rail-${s.id}`}
            className="rail-dot absolute -left-[3px] h-1.5 w-1.5 rounded-full"
            style={{ top: `${(i / (SECTIONS.length - 1)) * 100}%` }}
            title={s.label}
          />
        ))}
      </div>
    </div>
  );
}
