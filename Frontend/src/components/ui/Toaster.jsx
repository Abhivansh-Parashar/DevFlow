import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cx } from '../../lib/utils';

const STYLES = {
  success: { icon: CheckCircle2, cls: 'text-teal' },
  error: { icon: AlertTriangle, cls: 'text-coral' },
  info: { icon: Info, cls: 'text-azure' },
};

export function Toaster() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const { icon: Icon, cls } = STYLES[t.type] ?? STYLES.info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.9 }}
              className="glass-popover pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3"
              role="status"
            >
              <Icon size={17} className={cx('mt-0.5 shrink-0', cls)} strokeWidth={2.2} />
              <p className="flex-1 text-[13px] font-medium leading-snug text-ink">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="focus-ring shrink-0 rounded text-muted hover:text-ink"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
