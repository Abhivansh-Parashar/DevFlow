import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, FolderKanban, Users, CornerDownLeft } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Modal, Avatar, Badge } from '../ui';
import { STATUS_MAP, STATUS_COLORS } from '../../lib/constants';
import { cx } from '../../lib/utils';

export function SearchModal() {
  const open = useAppStore((s) => s.searchOpen);
  const close = useAppStore((s) => s.closeSearch);
  const setActiveProject = useAppStore((s) => s.setActiveProject);
  const issues = useAppStore((s) => s.issues);
  const projects = useAppStore((s) => s.projects);
  const users = useAppStore((s) => s.users);
  const activeWorkspace = useAppStore((s) => s.activeWorkspace());
  const currentUserId = useAppStore((s) => s.currentUserId);
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    if (!activeWorkspace || !q.trim()) return { issues: [], projects: [], users: [] };
    const needle = q.toLowerCase();
    const wsProjects = projects.filter((p) => p.workspaceId === activeWorkspace.id);
    const projIds = new Set(wsProjects.map((p) => p.id));
    return {
      issues: issues
        .filter((i) => projIds.has(i.projectId))
        .filter((i) => `${i.key} ${i.title} ${i.labels.join(' ')} ${i.description}`.toLowerCase().includes(needle))
        .slice(0, 6),
      projects: wsProjects
        .filter((p) => p.name.toLowerCase().includes(needle))
        .slice(0, 4),
      users: users
        .filter((u) => activeWorkspace.memberIds.includes(u.id))
        .filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(needle))
        .slice(0, 4),
    };
  }, [q, activeWorkspace, issues, projects, users]);

  const flat = useMemo(
    () => [...results.issues.map((i) => ({ kind: 'issue', id: i.id, label: `${i.key} · ${i.title}` })), ...results.projects.map((p) => ({ kind: 'project', id: p.id, label: p.name })), ...results.users.map((u) => ({ kind: 'user', id: u.id, label: u.name }))],
    [results]
  );

  useEffect(() => {
    if (open) {
      setQ('');
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const go = (item) => {
    close();
    if (item.kind === 'issue') {
      const issue = issues.find((i) => i.id === item.id);
      if (issue) setActiveProject(issue.projectId);
      navigate(`/app/issue/${item.id}`);
    } else if (item.kind === 'project') {
      setActiveProject(item.id);
      navigate('/app/board');
    } else {
      navigate('/app/members');
    }
  };

  const onKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && flat[index]) {
      go(flat[index]);
    }
  };

  const Section = ({ title, icon: Icon, children }) =>
    children.length > 0 ? (
      <div className="mt-3">
        <div className="mb-1.5 flex items-center gap-1.5 px-1">
          <Icon size={12} className="text-muted" />
          <span className="mono-label">{title}</span>
        </div>
        <div className="space-y-0.5">{children}</div>
      </div>
    ) : null;

  return (
    <Modal
      isOpen={open}
      onClose={close}
      hideClose
      width="max-w-xl"
      title="Search"
      subtitle={`Everything in ${activeWorkspace?.name ?? ''} — issues, projects, members`}
    >
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setIndex(0); }}
          onKeyDown={onKey}
          placeholder="Search issues, projects, people…"
          className="focus-ring ph-muted glass-input h-11 w-full rounded-xl pl-10 pr-4 text-sm text-ink"
        />
      </div>

      {q.trim() && flat.length === 0 && (
        <p className="py-8 text-center text-sm text-muted">
          No matches for “{q}” in this workspace.
        </p>
      )}

      {!q.trim() && (
        <p className="py-8 text-center text-sm text-muted">
          Tip: use <kbd className="rounded bg-raised px-1.5 py-0.5 font-mono text-xs">⌘K</kbd> anywhere, type, and press Enter to jump to an issue.
        </p>
      )}

      <div className="mt-2">
        <Section title="Issues" icon={FileText}>
          {results.issues.map((i, idx) => (
            <Row
              key={i.id}
              active={flat[index]?.id === i.id}
              onClick={() => go(flat.find((f) => f.id === i.id))}
              left={<span className="font-mono text-xs font-semibold text-teal">{i.key}</span>}
              label={i.title}
              right={<Badge variant={STATUS_MAP[i.status] ? 'neutral' : 'neutral'} dot>{i.status.replace('_', ' ')}</Badge>}
            />
          ))}
        </Section>
        <Section title="Projects" icon={FolderKanban}>
          {results.projects.map((p, idx) => (
            <Row
              key={p.id}
              active={flat[index]?.id === p.id}
              onClick={() => go(flat.find((f) => f.id === p.id))}
              left={<span className="grid h-5 w-5 place-items-center rounded text-[9px] font-bold text-white" style={{ background: p.color }}>{p.icon}</span>}
              label={p.name}
              right={<span className="text-[11px] font-mono text-muted">{p.keyPrefix}-*</span>}
            />
          ))}
        </Section>
        <Section title="Members" icon={Users}>
          {results.users.map((u, idx) => (
            <Row
              key={u.id}
              active={flat[index]?.id === u.id}
              onClick={() => go(flat.find((f) => f.id === u.id))}
              left={<Avatar user={u} size={22} />}
              label={u.name}
              right={<span className="text-[11px] font-mono text-muted">{u.email}</span>}
            />
          ))}
        </Section>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-line pt-3 text-[11px] text-muted">
        <span className="flex items-center gap-1"><kbd className="rounded bg-raised px-1.5 py-0.5 font-mono">↑↓</kbd> navigate</span>
        <span className="flex items-center gap-1"><kbd className="rounded bg-raised px-1.5 py-0.5 font-mono">↵</kbd> open</span>
        <span className="flex items-center gap-1"><CornerDownLeft size={11} /> to jump</span>
      </div>
    </Modal>
  );
}

function Row({ active, onClick, left, label, right }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={undefined}
      className={cx('focus-ring flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left', active ? 'fill-raised' : 'hover:bg-raised')}
    >
      <span className="flex w-14 shrink-0 items-center justify-start">{left}</span>
      <span className="flex-1 truncate text-[13px] font-medium text-ink">{label}</span>
      {right}
    </button>
  );
}
