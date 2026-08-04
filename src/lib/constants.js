export const STATUSES = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

export const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.id, s]));

// Status → signal accent (CSS var string, used for dots, badges, inline styles)
export const STATUS_COLORS = {
  backlog: 'var(--text-muted)',
  todo: 'var(--signal-azure)',
  in_progress: 'var(--signal-amber)',
  review: 'var(--signal-violet)',
  done: 'var(--signal-teal)',
};

export const PRIORITIES = [
  { id: 'high', label: 'High', color: 'var(--signal-coral)' },
  { id: 'medium', label: 'Medium', color: 'var(--signal-amber)' },
  { id: 'low', label: 'Low', color: 'var(--signal-teal)' },
];

export const PRIORITY_MAP = Object.fromEntries(PRIORITIES.map((p) => [p.id, p]));

export const LABELS = ['bug', 'feature', 'design', 'perf', 'refactor', 'infra', 'ai', 'docs'];

export const AVATAR_COLORS = [
  '#009E88',
  '#7C6AE8',
  '#E08A2E',
  '#E14F4F',
  '#3B82F6',
  '#10B981',
  '#EC4899',
  '#8B5CF6',
  '#F59E0B',
];

export const PROJECT_ACCENTS = ['#009E88', '#7C6AE8', '#FFB454', '#FF6B6B', '#3B82F6', '#10B981', '#EC4899'];

export const WORKSPACE_ROLES = ['Owner', 'Admin', 'Member'];
export const PROJECT_ROLES = ['Owner', 'Member'];

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', to: '/app/dashboard', icon: 'dashboard' },
  { id: 'board', label: 'Board', to: '/app/board', icon: 'board' },
  { id: 'chat', label: 'Chat', to: '/app/chat', icon: 'chat' },
  { id: 'members', label: 'Members', to: '/app/members', icon: 'members' },
  { id: 'analytics', label: 'Analytics', to: '/app/analytics', icon: 'analytics' },
  { id: 'ai', label: 'AI Assistant', to: '/app/ai', icon: 'ai' },
];
