/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--surface-canvas)',
        card: 'var(--surface-card)',
        raised: 'var(--surface-raised)',
        ink: 'var(--text-primary)',
        muted: 'var(--text-muted)',
        line: 'var(--border-subtle)',
        teal: 'var(--signal-teal)',
        amber: 'var(--signal-amber)',
        coral: 'var(--signal-coral)',
        violet: 'var(--signal-violet)',
        azure: 'var(--signal-azure)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        pop: 'var(--shadow-pop)',
        glow: '0 0 0 1px color-mix(in srgb, var(--signal-teal) 35%, transparent), 0 8px 40px color-mix(in srgb, var(--signal-teal) 25%, transparent)',
        'sb-hard': 'var(--sb-shadow)',
        'sb-hard-hover': 'var(--sb-shadow-hover)',
      },
      transitionTimingFunction: {
        'sb-spring': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      maxWidth: {
        prose: '68ch',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.6)', opacity: '0.9' },
          '80%': { transform: 'scale(2.6)', opacity: '0' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        typingBounce: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-3px)', opacity: '1' },
        },
      },
      animation: {
        'pulse-ring': 'pulseRing 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'typing-dot': 'typingBounce 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('brutal', '.brutal &');
    },
  ],
};
