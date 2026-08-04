import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cx } from '../../lib/utils';

export function Dropdown({ trigger, items = [], align = 'right', width = 'w-56', offset = 'mt-2', className, onOpenChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
  };

  const run = (item) => {
    setOpen(false);
    onOpenChange?.(false);
    item.onClick?.();
  };

  return (
    <div className={cx('relative', className)} ref={ref}>
      <div onClick={toggle}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            className={cx(
              'glass-popover absolute z-50 rounded-xl p-1.5',
              align === 'right' ? 'right-0' : 'left-0',
              width,
              offset
            )}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {items.map((item, i) =>
              item.divider ? (
                <div key={`d-${i}`} className="my-1.5 border-t border-line" />
              ) : (
                <button
                  key={item.label}
                  disabled={item.disabled}
                  onClick={() => run(item)}
                  className={cx(
                    'focus-ring flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors disabled:opacity-40',
                    item.danger ? 'text-coral hover:fill-coral-soft' : 'text-ink hover:bg-raised'
                  )}
                >
                  {item.icon && <item.icon size={15} strokeWidth={2} className={item.danger ? 'text-coral' : 'text-muted'} />}
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.checked && <Check size={14} className="text-teal" />}
                  {item.right && <span className="text-xs text-muted">{item.right}</span>}
                </button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
