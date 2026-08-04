import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cx } from '../../lib/utils';

export function SlideOverPanel({ isOpen, onClose, title, subtitle, width = 'max-w-[620px]', children, footer, headerExtra }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
          />
          <motion.div
            className={cx('card-surface absolute right-0 top-0 flex h-full w-full flex-col shadow-pop', width)}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
              <div className="min-w-0">
                {title && <h2 className="truncate font-display text-lg font-semibold text-ink">{title}</h2>}
                {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {headerExtra}
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-raised hover:text-ink"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
