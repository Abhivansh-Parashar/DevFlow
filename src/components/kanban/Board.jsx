import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors,
  useDroppable, closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Search, MessageSquare, GitCommit, MoreHorizontal, Inbox, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Badge, PriorityBadge, Avatar, PipelineLine, EmptyState, Button } from '../ui';
import { NewIssueSlideOver } from './NewIssueSlideOver';
import { CreateProjectModal } from '../projects/CreateProjectModal';
import { STATUSES, STATUS_COLORS, PRIORITIES, LABELS } from '../../lib/constants';
import { cx } from '../../lib/utils';

const containerId = (status) => `column:${status}`;

// Priority → accent stripe color for quick visual scanning.
const PRIORITY_COLOR = Object.fromEntries(PRIORITIES.map((p) => [p.id, p.color]));

// Optional WIP caps per column — the count badge and progress bar turn coral
// when a column exceeds its limit.
const WIP_LIMITS = { backlog: null, todo: 6, in_progress: 5, review: 4, done: null };

// Cards older than this (with no update) get an "aging" treatment.
const AGING_DAYS = 5;
const STALE_DAYS = 8;

function useFilters(projectIssues) {
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('all');
  const [assignee, setAssignee] = useState('all');
  const [labels, setLabels] = useState([]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return projectIssues.filter((i) => {
      if (priority !== 'all' && i.priority !== priority) return false;
      if (assignee !== 'all' && i.assigneeId !== assignee) return false;
      if (labels.length && !labels.some((l) => i.labels.includes(l))) return false;
      if (needle && !`${i.key} ${i.title} ${i.labels.join(' ')}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [projectIssues, search, priority, assignee, labels]);

  return { search, setSearch, priority, setPriority, assignee, setAssignee, labels, setLabels, filtered };
}

function SortableCard({ issue, users, onStatusChange }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id });
  const navigate = useNavigate();
  const assignee = users.find((u) => u.id === issue.assigneeId);
  const statusOptions = STATUSES.filter((s) => s.id !== issue.status);

  // Aging detection: open issues without an update get an amber/coral treatment.
  const ageDays = (Date.now() - new Date(issue.updatedAt).getTime()) / 86_400_000;
  const stale = issue.status !== 'done' && ageDays > AGING_DAYS;
  const staleColor = stale ? (ageDays > STALE_DAYS ? 'var(--signal-coral)' : 'var(--signal-amber)') : null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'manipulation',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cx('group relative mb-2.5 select-none', isDragging && 'opacity-30')}
      {...attributes}
      {...listeners}
    >
      <div
        onClick={() => navigate(`/app/issue/${issue.id}`)}
        className="card-surface focus-ring relative cursor-pointer rounded-xl p-3 shadow-soft transition-all duration-150 hover:-translate-y-px hover:shadow-pop"
        style={{
          // Aging/overdue treatment tints the non-left edges + adds a soft ring.
          ...(stale && staleColor
            ? {
                borderColor: staleColor,
                boxShadow: `0 0 0 1px color-mix(in srgb, ${staleColor} 30%, transparent), var(--shadow-soft)`,
              }
            : {}),
          // Priority accent stripe — a 3px left border that follows the rounded corner.
          // Set last so the stripe keeps its priority color even on aging cards.
          borderLeft: `3px solid ${PRIORITY_COLOR[issue.priority] ?? 'var(--signal-teal)'}`,
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/app/issue/${issue.id}`)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-teal">{issue.key}</span>
            <PriorityBadge priority={issue.priority} size="sm" />
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <StatusMenu statusOptions={statusOptions} onSelect={onStatusChange} issueKey={issue.key} />
          </div>
        </div>

        <p className="mt-1.5 line-clamp-2 text-[13.5px] font-medium leading-snug text-ink">{issue.title}</p>

        <div className="mt-2.5 flex items-center gap-1.5">
          {/* Chips wrap onto a second line instead of overflowing the card */}
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {stale && staleColor && (
              <span
                className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                style={{ color: staleColor, background: `color-mix(in srgb, ${staleColor} 12%, transparent)` }}
              >
                <Clock size={10} /> aging · {Math.floor(ageDays)}d
              </span>
            )}
            {issue.labels.slice(0, 2).map((l) => (
              <span key={l} className="rounded-md bg-raised px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted">
                {l}
              </span>
            ))}
          </div>
          {/* Counts + avatar always hug the right edge and never spill out */}
          <div className="flex shrink-0 items-center gap-1.5">
            {issue.comments.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-muted">
                <MessageSquare size={11} /> {issue.comments.length}
              </span>
            )}
            {issue.commits.length > 0 && (
              <span className="flex items-center gap-1 font-mono text-[11px] text-muted">
                <GitCommit size={11} /> {issue.commits.length}
              </span>
            )}
            {assignee && <Avatar user={assignee} size={20} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusMenu({ statusOptions, onSelect, issueKey }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Move ${issueKey} to another column`}
        className="focus-ring grid h-6 w-6 place-items-center rounded-md text-muted opacity-0 transition-opacity hover:bg-raised hover:text-ink group-hover:opacity-100"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div className="glass-popover absolute right-0 top-7 z-30 w-44 rounded-xl p-1.5">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">Move to</p>
          {statusOptions.map((s) => (
            <button
              key={s.id}
              onClick={() => { onSelect(s.id); setOpen(false); }}
              className="focus-ring flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium text-ink hover:bg-raised"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[s.id] }} />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Column({ status, items, users, onNewIssue, onStatusChange, total }) {
  const { setNodeRef, isOver } = useDroppable({ id: containerId(status.id) });
  const color = STATUS_COLORS[status.id];
  const limit = WIP_LIMITS[status.id];
  const overLimit = limit != null && items.length > limit;
  const pct = total ? Math.min(100, (items.length / total) * 100) : 0;
  return (
    <div
      ref={setNodeRef}
      className={cx(
        'relative flex w-[292px] shrink-0 snap-start flex-col rounded-xl border bg-card transition-colors duration-200',
        isOver ? 'border-teal shadow-glow' : 'border-line'
      )}
      style={isOver ? { background: 'color-mix(in srgb, var(--signal-teal) 5%, var(--surface-card))' } : undefined}
    >
      <div className="flex items-center gap-2 px-3.5 pb-2 pt-3">
        <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-ink">{status.label}</h3>
        <span
          className={cx(
            'rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold transition-colors',
            overLimit ? 'fill-coral-soft text-coral' : 'bg-raised text-muted'
          )}
        >
          {limit != null ? `${items.length}/${limit}` : items.length}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => onNewIssue(status.id)}
          aria-label={`New issue in ${status.label}`}
          className="focus-ring grid h-6 w-6 place-items-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink"
        >
          <Plus size={14} />
        </button>
      </div>
      {/* Column progress: share of the board + WIP state */}
      <div className="mx-3.5 mb-2.5" title={limit != null ? `WIP limit ${limit}` : 'No WIP limit'}>
        <div className="h-1 overflow-hidden rounded-full bg-raised">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: overLimit ? 'var(--signal-coral)' : color }}
          />
        </div>
      </div>
      <div className="max-h-[calc(100vh-260px)] min-h-[60px] overflow-y-auto px-2.5 pb-3 pt-1">
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((i) => (
            <SortableCard key={i.id} issue={i} users={users} onStatusChange={(s) => onStatusChange(i.id, s)} />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-xs text-muted">
            <Inbox size={14} className="mx-auto mb-1.5" />
            No issues — create your first to start
          </div>
        )}
      </div>
    </div>
  );
}

export function Board() {
  const activeWorkspace = useAppStore((s) => s.activeWorkspace());
  const activeProject = useAppStore((s) => s.activeProject());
  const issues = useAppStore((s) => s.issues);
  const users = useAppStore((s) => s.users);
  const moveIssue = useAppStore((s) => s.moveIssue);
  const toast = useAppStore((s) => s.toast);
  const [board, setBoard] = useState(null);
  const draggingRef = useRef(false);
  const [activeId, setActiveId] = useState(null);
  const [newIssueOpen, setNewIssueOpen] = useState(false);
  const [newIssueStatus, setNewIssueStatus] = useState('backlog');
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const projectIssues = useMemo(
    () => issues.filter((i) => i.projectId === activeProject?.id),
    [issues, activeProject]
  );
  const filters = useFilters(projectIssues);

  const build = useCallback(() => {
    const map = {};
    STATUSES.forEach((s) => {
      map[s.id] = filters.filtered.filter((i) => i.status === s.id);
    });
    return map;
  }, [filters.filtered]);

  useEffect(() => {
    if (!draggingRef.current) setBoard(build());
  }, [build]);

  const statusOf = useCallback((id, b) => {
    if (typeof id === 'string' && id.startsWith('column:')) return id.slice(7);
    return Object.keys(b).find((st) => b[st].some((i) => i.id === id));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragStart = (e) => {
    draggingRef.current = true;
    setActiveId(e.active.id);
  };

  const onDragOver = (e) => {
    const { active, over } = e;
    if (!over || !board) return;
    const from = statusOf(active.id, board);
    const to = statusOf(over.id, board);
    if (!from || !to || from === to) return;
    setBoard((prev) => {
      const moving = prev[from].find((i) => i.id === active.id);
      if (!moving) return prev;
      const fromItems = prev[from].filter((i) => i.id !== active.id);
      const overIsContainer = typeof over.id === 'string' && over.id.startsWith('column:');
      const toItems = overIsContainer ? [...prev[to]] : prev[to].slice();
      if (!overIsContainer) {
        const overIndex = toItems.findIndex((i) => i.id === over.id);
        if (overIndex >= 0) toItems.splice(overIndex, 0, moving);
        else toItems.push(moving);
      } else {
        toItems.push(moving);
      }
      return { ...prev, [from]: fromItems, [to]: toItems };
    });
  };

  const onDragEnd = (e) => {
    const { active, over } = e;
    if (board && over) {
      const from = statusOf(active.id, board);
      const to = statusOf(over.id, board);
      if (from === to && active.id !== over.id) {
        const list = board[from];
        const oldIndex = list.findIndex((i) => i.id === active.id);
        const newIndex = list.findIndex((i) => i.id === over.id);
        if (oldIndex >= 0 && newIndex >= 0) {
          setBoard((prev) => ({ ...prev, [from]: arrayMove(prev[from], oldIndex, newIndex) }));
        }
      } else if (from && to && from !== to) {
        moveIssue(active.id, to);
      }
    }
    draggingRef.current = false;
    setActiveId(null);
  };

  const onDragCancel = () => {
    draggingRef.current = false;
    setActiveId(null);
    setBoard(build());
  };

  const activeIssue = activeId ? issues.find((i) => i.id === activeId) : null;
  const projectMembers = users.filter((u) => activeProject?.memberIds.includes(u.id));

  // Workspace has no projects at all
  if (activeWorkspace && !useAppStore.getState().projects.some((p) => p.workspaceId === activeWorkspace.id && p.memberIds.includes(useAppStore.getState().currentUserId))) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <EmptyState
          icon={Plus}
          title="This workspace has no projects yet"
          description="Create a project to give issues, chat, and analytics a home."
          actionLabel="Create project"
          onAction={() => setCreateProjectOpen(true)}
        />
        <CreateProjectModal isOpen={createProjectOpen} onClose={() => setCreateProjectOpen(false)} />
      </div>
    );
  }

  if (!activeProject || !board) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <EmptyState
          icon={Inbox}
          title="Select a project"
          description="Pick a project from the sidebar — everything re-scopes to it."
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)] min-h-[480px] flex-col">
      <div className="flex flex-wrap items-center gap-3 px-5 pb-3 pt-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-white" style={{ background: activeProject.color }}>
              {activeProject.icon}
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-bold text-ink">{activeProject.name}</h1>
              <p className="truncate text-xs text-muted">{activeProject.description}</p>
            </div>
          </div>
        </div>
        <div className="flex-1" />
        <Button icon={Plus} onClick={() => { setNewIssueStatus('backlog'); setNewIssueOpen(true); }}>
          New Issue
        </Button>
      </div>

      <FilterBar filters={filters} members={projectMembers} />

      <div className="relative flex-1 overflow-hidden">
        <PipelineLine variant="board" className="opacity-70" />
        <div className="absolute inset-0 z-10 overflow-x-auto overscroll-x-contain px-5 pb-6 pt-1">
          <div className="flex h-full min-h-[420px] items-start gap-3.5 snap-x snap-proximity">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
              onDragCancel={onDragCancel}
            >
              {STATUSES.map((s) => (
                <Column
                  key={s.id}
                  status={s}
                  items={board[s.id] ?? []}
                  users={users}
                  total={filters.filtered.length}
                  onNewIssue={(status) => { setNewIssueStatus(status); setNewIssueOpen(true); }}
                  onStatusChange={(id, status) => moveIssue(id, status)}
                />
              ))}
              <DragOverlay>
                {activeIssue && (
                  <div className="rotate-1 scale-[1.03] shadow-pop">
                    <div className="card-surface rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-teal">{activeIssue.key}</span>
                        <PriorityBadge priority={activeIssue.priority} size="sm" />
                      </div>
                      <p className="mt-1.5 text-[13.5px] font-medium text-ink">{activeIssue.title}</p>
                      <p className="mt-1 font-mono text-[11px] text-muted">Drop to move · ⌘ drag anywhere</p>
                    </div>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>

      <NewIssueSlideOver
        isOpen={newIssueOpen}
        onClose={() => setNewIssueOpen(false)}
        initialStatus={newIssueStatus}
        project={activeProject}
        members={projectMembers}
      />
    </div>
  );
}

function FilterBar({ filters, members }) {
  const { search, setSearch, priority, setPriority, assignee, setAssignee, labels, setLabels } = filters;
  const active = search || priority !== 'all' || assignee !== 'all' || labels.length;
  return (
    <div className="flex flex-wrap items-center gap-2 px-5 pb-3">
      <div className="relative">
        <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by key, title…"
          className="focus-ring ph-muted h-8 w-52 rounded-lg border border-line bg-raised pl-8 pr-3 text-[13px] text-ink focus:border-teal"
        />
      </div>
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="focus-ring h-8 cursor-pointer rounded-lg border border-line bg-raised px-2.5 text-[13px] text-ink focus:border-teal"
        aria-label="Filter by priority"
      >
        <option value="all">Any priority</option>
        {PRIORITIES.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>
      <select
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
        className="focus-ring h-8 cursor-pointer rounded-lg border border-line bg-raised px-2.5 text-[13px] text-ink focus:border-teal"
        aria-label="Filter by assignee"
      >
        <option value="all">Anyone</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
      <div className="flex flex-wrap items-center gap-1.5">
        {LABELS.map((l) => {
          const on = labels.includes(l);
          return (
            <button
              key={l}
              onClick={() => setLabels((prev) => (on ? prev.filter((x) => x !== l) : [...prev, l]))}
              className={cx(
                'focus-ring rounded-md px-2 py-1 font-mono text-[11px] font-medium transition-colors',
                on ? 'fill-teal-soft text-teal' : 'bg-raised text-muted hover:text-ink'
              )}
            >
              {l}
            </button>
          );
        })}
      </div>
      {active && (
        <button
          onClick={() => { setSearch(''); setPriority('all'); setAssignee('all'); setLabels([]); }}
          className="focus-ring rounded-md px-2 py-1 text-xs font-medium text-coral hover:fill-coral-soft"
        >
          Clear filters
        </button>
      )}
      <div className="flex-1" />
      <span className="hidden text-[11px] font-mono text-muted sm:block">drag cards · ⋯ menu moves by keyboard</span>
    </div>
  );
}
