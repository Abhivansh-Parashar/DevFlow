import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown, Plus, Building2, LayoutDashboard, MessageSquare, Users,
  BarChart3, Sparkles, Settings, X, LogOut, Gauge,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Dropdown, Avatar, Modal, Field, Input, Button, Badge } from '../ui';
import { CreateProjectModal } from '../projects/CreateProjectModal';
import { navItems } from '../../lib/constants';
import { cx } from '../../lib/utils';

const ICONS = {
  dashboard: Gauge,
  board: LayoutDashboard,
  chat: MessageSquare,
  members: Users,
  analytics: BarChart3,
  ai: Sparkles,
};

function WorkspaceSwitcher() {
  const workspaces = useAppStore((s) => s.workspaces);
  const activeWorkspace = useAppStore((s) => s.activeWorkspace());
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const role = useAppStore((s) => (s.activeWorkspace() ? s.workspaceRole(s.activeWorkspace().id) : ''));
  const createWorkspace = useAppStore((s) => s.createWorkspace);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');

  const assigned = workspaces.filter((w) => w.memberIds.includes(currentUserId));

  const items = [
    ...assigned.map((w) => ({
      label: w.name,
      icon: Building2,
      right: w.id === activeWorkspace?.id ? 'active' : undefined,
      checked: w.id === activeWorkspace?.id,
      onClick: () => setActiveWorkspace(w.id),
    })),
    { divider: true },
    { label: 'Create workspace', icon: Plus, onClick: () => setCreateOpen(true) },
  ];

  return (
    <>
      <Dropdown
        align="left"
        width="w-64"
        offset="mt-2"
        trigger={
          <button className="focus-ring flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-raised">
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold text-white"
              style={{ background: activeWorkspace?.accent ?? 'var(--signal-teal)' }}
            >
              {activeWorkspace?.icon ?? '◆'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{activeWorkspace?.name ?? 'No workspace'}</span>
              <span className="block text-[11px] font-medium uppercase tracking-wide text-muted">{role}</span>
            </span>
            <ChevronDown size={15} className="shrink-0 text-muted" />
          </button>
        }
        items={items}
      />

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create workspace"
        subtitle="The top-level container — you'll be its Owner."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              disabled={!name.trim()}
              onClick={() => {
                createWorkspace({ name });
                setCreateOpen(false);
                setName('');
              }}
            >
              Create workspace
            </Button>
          </>
        }
      >
        <Field label="Workspace name">
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Orbital Systems" />
        </Field>
      </Modal>
    </>
  );
}

function ProjectList() {
  const projects = useAppStore((s) => s.projects);
  const activeWorkspace = useAppStore((s) => s.activeWorkspace());
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const setActiveProject = useAppStore((s) => s.setActiveProject);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const issues = useAppStore((s) => s.issues);
  const users = useAppStore((s) => s.users);
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  if (!activeWorkspace) return null;
  const scoped = projects.filter((p) => p.workspaceId === activeWorkspace.id && p.memberIds.includes(currentUserId));

  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between px-2.5">
        <span className="mono-label">Projects</span>
        <button
          onClick={() => setCreateOpen(true)}
          aria-label="New project"
          className="focus-ring grid h-6 w-6 place-items-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="space-y-0.5">
        {scoped.map((p) => {
          const count = issues.filter((i) => i.projectId === p.id && i.status !== 'done').length;
          const members = users.filter((u) => p.memberIds.includes(u.id));
          const active = p.id === activeProjectId;
          return (
            <button
              key={p.id}
              onClick={() => {
                setActiveProject(p.id);
                navigate('/app/board');
              }}
              className={cx(
                'focus-ring group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                active ? 'fill-raised' : 'hover:bg-raised'
              )}
            >
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-bold text-white"
                style={{ background: p.color }}
              >
                {p.icon}
              </span>
              <span className={cx('min-w-0 flex-1 truncate text-[13px] font-medium', active ? 'text-ink' : 'text-muted group-hover:text-ink')}>
                {p.name}
              </span>
              <span className="shrink-0 text-[11px] font-mono text-muted">{count}</span>
              <span className="hidden shrink-0 -space-x-1 sm:flex">
                {members.slice(0, 3).map((m) => (
                  <Avatar key={m.id} user={m} size={16} />
                ))}
              </span>
            </button>
          );
        })}
        {scoped.length === 0 && (
          <p className="px-2.5 py-2 text-xs text-muted">No projects yet — create the first one.</p>
        )}
      </div>
      <CreateProjectModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function Nav() {
  return (
    <div className="mt-6">
      <div className="mb-2 px-2.5">
        <span className="mono-label">Navigation</span>
      </div>
      <div className="space-y-0.5">
        {navItems.map((item) => {
          const Icon = ICONS[item.icon];
          const isAi = item.id === 'ai';
          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                cx(
                  'focus-ring group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
                  isActive
                    ? isAi
                      ? 'fill-violet-soft text-violet'
                      : 'fill-teal-soft text-teal'
                    : 'text-muted hover:bg-raised hover:text-ink'
                )
              }
            >
              <Icon size={16} strokeWidth={2} className={isAi ? 'text-violet' : ''} />
              <span className="flex-1">{item.label}</span>
              {isAi && <Badge variant="violet" size="sm">AI</Badge>}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

function UserCard({ onNavigate }) {
  const currentUser = useAppStore((s) => s.currentUser());
  const signOut = useAppStore((s) => s.signOut);
  const toast = useAppStore((s) => s.toast);
  const navigate = useNavigate();

  if (!currentUser) return null;

  const items = [
    { label: 'Settings', icon: Settings, onClick: () => { onNavigate?.(); navigate('/app/settings'); } },
    { divider: true },
    {
      label: 'Sign out',
      icon: LogOut,
      danger: true,
      onClick: () => {
        signOut();
        toast('info', 'Signed out — see you soon.');
        navigate('/login');
      },
    },
  ];

  return (
    <Dropdown
      align="left"
      width="w-56"
      trigger={
        <button className="focus-ring flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-raised">
          <Avatar user={currentUser} size={30} showStatus />
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-[13px] font-semibold text-ink">{currentUser.name}</span>
            <span className="block truncate text-[11px] text-muted">{currentUser.email}</span>
          </span>
          <ChevronDown size={14} className="text-muted" />
        </button>
      }
      items={items}
    />
  );
}

export function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();
  const content = (
    <div className="flex h-full flex-col">
      <div className="px-3 pt-4">
        <div className="mb-4 flex items-center justify-between px-1">
          <button
            onClick={() => { onClose?.(); navigate('/'); }}
            className="focus-ring flex items-center gap-2 rounded-lg px-1"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-card">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h5l2.5-6 3 12 2.5-6H21" />
              </svg>
            </span>
            <span className="font-display text-[15px] font-bold tracking-tight text-ink">DevFlow</span>
          </button>
          <button onClick={onClose} className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-raised md:hidden">
            <X size={16} />
          </button>
        </div>
        <WorkspaceSwitcher />
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <ProjectList />
        <Nav />
      </div>
      <div className="border-t border-line px-3 py-3">
        <UserCard onNavigate={onClose} />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="glass-sidebar fixed inset-y-0 left-0 z-40 hidden w-64 md:block">
        {content}
      </aside>
      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="glass-sidebar fixed inset-y-0 left-0 z-50 w-72 md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
