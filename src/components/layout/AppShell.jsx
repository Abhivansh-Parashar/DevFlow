import { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SearchModal } from './SearchModal';
import { InviteStack } from '../invites/InviteStack';

export function AppShell() {
  const signedIn = useAppStore((s) => s.signedIn);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const openSearch = useAppStore((s) => s.openSearch);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  // Brief skeleton while routes swap, so navigation always feels responsive.
  const [routeLoading, setRouteLoading] = useState(true);

  useEffect(() => {
    setRouteLoading(true);
    const t = setTimeout(() => setRouteLoading(false), 180);
    return () => clearTimeout(t);
  }, [location.pathname, activeWorkspaceId, activeProjectId]);

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openSearch]);

  // Bootstrap a scoped context once (e.g. after a fresh sign-in).
  useEffect(() => {
    if (!signedIn || !currentUserId) return;
    const st = useAppStore.getState();
    if (st.activeWorkspaceId) return;
    const assigned = st.workspaces.filter((w) => w.memberIds.includes(currentUserId));
    if (assigned.length) st.setActiveWorkspace(assigned[0].id);
    else st.createWorkspace({ name: 'My Workspace' });
  }, [signedIn, currentUserId, activeWorkspaceId]);

  if (!signedIn || !currentUserId) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenu={() => setSidebarOpen(true)} />

      <main className="pt-14 md:pl-64">
        {routeLoading ? (
          <PageSkeleton />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeWorkspaceId}:${activeProjectId}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <SearchModal />
      {/* Pending project/workspace invites — first screen after login */}
      <InviteStack />
      {/* esc closes mobile drawer */}
      <EscDrawer onClose={() => setSidebarOpen(false)} open={sidebarOpen} />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-5 px-5 py-6" aria-hidden="true">
      {/* Title block */}
      <div className="flex items-center gap-3">
        <div className="skeleton h-9 w-9 rounded-xl" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-44 rounded-md" />
          <div className="skeleton h-3 w-64 rounded-md" />
        </div>
      </div>
      {/* Toolbar */}
      <div className="skeleton h-10 w-full max-w-lg rounded-xl" />
      {/* Content blocks */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={i % 3 === 0 ? 'skeleton h-44 rounded-2xl' : i % 3 === 1 ? 'skeleton h-36 rounded-2xl' : 'skeleton h-52 rounded-2xl'} />
        ))}
      </div>
    </div>
  );
}

function EscDrawer({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return null;
}
