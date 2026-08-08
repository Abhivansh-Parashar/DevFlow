import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, GitCommit, AtSign, Tag, MessageSquare, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cx, timeAgo } from '../../lib/utils';

const TYPE_META = {
  commit: { icon: GitCommit, cls: 'text-teal' },
  mention: { icon: AtSign, cls: 'text-violet' },
  status: { icon: Tag, cls: 'text-amber' },
  chat: { icon: MessageSquare, cls: 'text-azure' },
};

export function NotificationsPanel() {
  const notifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAll = useAppStore((s) => s.markAllNotificationsRead);
  const removeNotification = useAppStore((s) => s.removeNotification);
  const clearAll = useAppStore((s) => s.clearAllNotifications);
  const setActiveProject = useAppStore((s) => s.setActiveProject);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const openIssue = (n) => {
    markRead(n.id);
    setOpen(false);
    if (n.issueId) {
      const issue = useAppStore.getState().issues.find((i) => i.id === n.issueId);
      if (issue) setActiveProject(issue.projectId);
      navigate(`/app/issue/${n.issueId}`);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications (${unread} unread)`}
        className="focus-ring relative grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink"
      >
        <Bell size={17} strokeWidth={2} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="glass-popover absolute right-0 z-50 mt-2 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
              <span className="font-display text-sm font-semibold text-ink">Notifications</span>
              <div className="flex shrink-0 items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={markAll}
                    className="focus-ring flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-teal hover:bg-raised"
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    aria-label="Clear all notifications"
                    title="Clear all"
                    className="focus-ring grid h-7 w-7 place-items-center rounded-md text-muted transition-colors hover:bg-raised hover:text-coral"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-[380px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <span className="grid h-10 w-10 place-items-center rounded-full fill-teal-soft text-teal">
                    <Check size={18} />
                  </span>
                  <p className="text-sm font-medium text-ink">All caught up</p>
                  <p className="text-xs text-muted">New activity across your projects lands here.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const meta = TYPE_META[n.type] ?? TYPE_META.chat;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={n.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openIssue(n)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openIssue(n);
                        }
                      }}
                      className={cx('focus-ring group relative flex w-full cursor-pointer items-start gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-0 hover:bg-raised')}
                      style={!n.read ? { background: 'color-mix(in srgb, var(--signal-teal) 5%, transparent)' } : undefined}
                    >
                      <span className={cx('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg fill-raised', meta.cls)}>
                        <Icon size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold leading-snug text-ink">{n.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted">{n.body}</span>
                        <span className="mt-1 block text-[11px] font-mono text-muted">{timeAgo(n.createdAt)}</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(n.id);
                        }}
                        aria-label={`Dismiss notification: ${n.title}`}
                        title="Dismiss"
                        className="focus-ring grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted opacity-0 transition-opacity hover:bg-raised hover:text-coral group-hover:opacity-100"
                      >
                        <X size={13} />
                      </button>
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal" style={{ boxShadow: '0 0 8px var(--signal-teal)' }} />}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
