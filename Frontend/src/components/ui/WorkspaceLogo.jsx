import { cx } from '../../lib/utils';

/**
 * Pre-made workspace logo marks — crisp geometric SVG marks that render on the
 * accent tile, replacing the old single-character glyphs. `icon` on a workspace
 * now stores a logo `id` from this list (with legacy glyphs falling back).
 */
export const WORKSPACE_LOGOS = [
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'bolt', label: 'Bolt' },
  { id: 'layers', label: 'Layers' },
  { id: 'shield', label: 'Shield' },
  { id: 'star', label: 'Star' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'orbit', label: 'Orbit' },
  { id: 'box', label: 'Box' },
  { id: 'wave', label: 'Wave' },
  { id: 'chip', label: 'Chip' },
  { id: 'target', label: 'Target' },
];

function Mark({ id }) {
  switch (id) {
    case 'hexagon':
      return <path d="M12 2 21 6.8v10.4L12 22 3 17.2V6.8z" />;
    case 'triangle':
      return <path d="M12 2.4 22 21H2z" />;
    case 'bolt':
      return <path d="M13.2 1.8 4.2 13.6h5.2L10.8 22l9-11.8h-5.2z" />;
    case 'layers':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round">
          <path d="m12 2.5 9 4.8-9 4.8-9-4.8z" />
          <path d="m3 11.7 9 4.8 9-4.8" />
          <path d="m3 16.6 9 4.8 9-4.8" />
        </g>
      );
    case 'shield':
      return <path d="M12 1.8 20 4.7v6c0 5-3.3 8.7-8 11.5-4.7-2.8-8-6.5-8-11.5v-6z" />;
    case 'star':
      return <path d="m12 2 3 6.6 7.1.6-5.3 4.8 1.6 7L12 17.4 5.6 21l1.6-7L1.9 9.2 9 8.6z" />;
    case 'pulse':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12.5h4.2l1.9-4.5 3.8 8 1.9-3.5H21" />
        </g>
      );
    case 'orbit':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.8">
          <ellipse cx="12" cy="12" rx="9.5" ry="4.6" transform="rotate(-24 12 12)" />
          <circle cx="17.6" cy="8.2" r="2.1" />
          <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
        </g>
      );
    case 'box':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round">
          <path d="M12 2.2 20.5 6.8v10.4L12 21.8 3.5 17.2V6.8z" />
          <path d="M9.2 10.2h5.6v5.4h-5.6z" />
        </g>
      );
    case 'wave':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
          <path d="M2.5 12c2.4-4.2 4.6-4.2 7 0s4.6 4.2 7 0 4.6-4.2 7 0" />
          <path d="M2.5 17c2.4-4.2 4.6-4.2 7 0s4.6 4.2 7 0 4.6-4.2 7 0" opacity="0.55" />
        </g>
      );
    case 'chip':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
          <rect x="6.5" y="6.5" width="11" height="11" rx="2.4" />
          <rect x="10" y="10" width="4" height="4" rx="0.8" fill="currentColor" stroke="none" />
          <path d="M9 2.5v4M15 2.5v4M9 17.5v4M15 17.5v4M2.5 9h4M2.5 15h4M17.5 9h4M17.5 15h4" />
        </g>
      );
    case 'target':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.9">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4.6" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </g>
      );
    default:
      return null;
  }
}

/**
 * Renders a workspace logo mark by id. Unknown ids (legacy glyphs like "▲")
 * fall back to the plain text glyph so nothing breaks for old data.
 */
export function WorkspaceLogo({ id, size = 18, fallback = '◆', className }) {
  const known = WORKSPACE_LOGOS.some((l) => l.id === id);
  if (!known) {
    return (
      <span
        className={cx('inline-flex select-none items-center justify-center font-bold leading-none', className)}
        style={{ fontSize: Math.round(size * 0.75) }}
        aria-hidden="true"
      >
        {fallback}
      </span>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cx('inline-block shrink-0', className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <Mark id={id} />
    </svg>
  );
}
