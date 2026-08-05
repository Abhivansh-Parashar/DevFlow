import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, Search, Moon, LogOut, Building2, FolderKanban, BrickWall } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Dropdown, Avatar } from '../ui';
import { NotificationsPanel } from '../notifications/NotificationsPanel';

const THEME_ICONS = { dark: Moon, brutal: BrickWall };
const THEME_LABELS = { dark: 'brutal', brutal: 'dark' };

function ThemeToggle() {
  const theme = useAppStore((s) => s.theme);
  const toggle = useAppStore((s) => s.toggleTheme);
  const Icon = THEME_ICONS[theme] ?? Moon;
  return (
    <motion.button
      onClick={toggle}
      aria-label={`Switch to ${THEME_LABELS[theme] ?? 'brutal'} mode`}
      title={`Theme: ${theme} — click for ${THEME_LABELS[theme] ?? 'brutal'}`}
      className="focus-ring relative grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink"
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="grid place-items-center"
        >
          <Icon size={17} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

function WorkspaceBreadcrumb() {
  const workspaces = useAppStore((s) => s.workspaces);
  const activeWorkspace = useAppStore((s) => s.activeWorkspace());
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const createWorkspace = useAppStore((s) => s.createWorkspace);

  if (!activeWorkspace) return null;
  const assigned = workspaces.filter((w) => w.memberIds.includes(currentUserId));

  return (
    <Dropdown
      align="left"
      width="w-60"
      items={[
        ...assigned.map((w) => ({
          label: w.name,
          icon: Building2,
          right: w.roles[currentUserId],
          checked: w.id === activeWorkspace.id,
          onClick: () => setActiveWorkspace(w.id),
        })),
        { divider: true },
        {
          label: 'Create workspace',
          icon: PlusIcon,
          onClick: () => {
            const name = window.prompt('Workspace name');
            if (name) createWorkspace({ name });
          },
        },
      ]}
      trigger={
        <button className="focus-ring flex max-w-[160px] items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-semibold text-ink transition-colors hover:bg-raised sm:max-w-[220px]">
          <span className="truncate">{activeWorkspace.name}</span>
          <ChevronDown size={13} className="shrink-0 text-muted" />
        </button>
      }
    />
  );
}

function ProjectBreadcrumb() {
  const projects = useAppStore((s) => s.projects);
  const activeWorkspace = useAppStore((s) => s.activeWorkspace());
  const activeProject = useAppStore((s) => s.activeProject());
  const setActiveProject = useAppStore((s) => s.setActiveProject);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const navigate = useNavigate();

  if (!activeWorkspace) return null;
  const scoped = projects.filter((p) => p.workspaceId === activeWorkspace.id && p.memberIds.includes(currentUserId));

  return (
    <Dropdown
      align="left"
      width="w-64"
      items={scoped.map((p) => ({
        label: p.name,
        icon: FolderKanban,
        checked: p.id === activeProject?.id,
        onClick: () => {
          setActiveProject(p.id);
          navigate('/app/board');
        },
      }))}
      trigger={
        <button className="focus-ring flex max-w-[160px] items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-medium text-muted transition-colors hover:bg-raised hover:text-ink sm:max-w-[240px]">
          <span
            className="grid h-4.5 w-4.5 shrink-0 place-items-center rounded text-[8px] font-bold text-white"
            style={{ background: activeProject?.color ?? 'var(--signal-teal)', height: 18, width: 18 }}
          >
            {activeProject?.icon ?? '#'}
          </span>
          <span className="truncate">{activeProject?.name ?? 'No project'}</span>
          <ChevronDown size={13} className="shrink-0 text-muted" />
        </button>
      }
    />
  );
}

function UserMenu() {
  const currentUser = useAppStore((s) => s.currentUser());
  const signOut = useAppStore((s) => s.signOut);
  const toast = useAppStore((s) => s.toast);
  const navigate = useNavigate();
  if (!currentUser) return null;
  return (
    <Dropdown
      align="right"
      width="w-52"
      items={[
        { label: currentUser.name, right: 'You', disabled: true },
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
      ]}
      trigger={
        <button className="focus-ring flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-raised">
          <Avatar user={currentUser} size={30} showStatus />
        </button>
      }
    />
  );
}

export function TopBar({ onMenu }) {
  const openSearch = useAppStore((s) => s.openSearch);
  return (
    <header className="glass-topbar fixed inset-x-0 top-0 z-30 h-14">
      <div className="flex h-full items-center gap-1 px-3 md:pl-[264px] md:pr-5">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-raised md:hidden"
        >
          <Menu size={18} />
        </button>

        <div className="flex min-w-0 items-center">
          <WorkspaceBreadcrumb />
          <span className="mx-1 text-line">/</span>
          <ProjectBreadcrumb />
        </div>

        <div className="flex-1" />

        <button
          onClick={openSearch}
          className="focus-ring hidden items-center gap-2 rounded-lg border border-line bg-raised px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-teal hover:text-ink sm:flex"
        >
          <Search size={14} />
          <span>Search issues…</span>
          <kbd className="ml-4 rounded border border-line bg-card px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>

        <div className="ml-2 sm:hidden">
          <button
            onClick={openSearch}
            aria-label="Search"
            className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-raised"
          >
            <Search size={17} />
          </button>
        </div>

        <div className="ml-1">
          <ThemeToggle />
        </div>
        <NotificationsPanel />
        <UserMenu />
      </div>
    </header>
  );
}

function PlusIcon({ size = 14, strokeWidth = 2 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
