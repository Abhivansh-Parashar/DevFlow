import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  X, Trash2, Copy, GitCommit, GitBranch, MessageSquare, User,
  CalendarDays, Link2, ChevronRight, Sparkles,
} from 'lucide-react';
import { Board } from '../kanban/Board';
import { useAppStore } from '../../store/useAppStore';
import { Badge, PriorityBadge, Avatar, Dropdown, Select, PipelineLine, Button, EmptyState, RichText, Input } from '../ui';
import { STATUSES, STATUS_MAP, STATUS_COLORS, PRIORITIES, PRIORITY_MAP, LABELS } from '../../lib/constants';
import { cx, timeAgo, shortSha, randomSha } from '../../lib/utils';

const StatusBadge = ({ status }) => (
  <span
    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
    style={{
      color: STATUS_COLORS[status],
      background: `color-mix(in srgb, ${STATUS_COLORS[status]} 13%, transparent)`,
      border: `1px solid color-mix(in srgb, ${STATUS_COLORS[status]} 32%, transparent)`,
    }}
  >
    <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLORS[status], boxShadow: `0 0 6px ${STATUS_COLORS[status]}` }} />
    {STATUS_MAP[status]?.label ?? status}
  </span>
);

function ActivityTimeline({ issue, users }) {
  const entries = useMemo(() => {
    const evts = [];
    issue.statusHistory.forEach((h) => evts.push({ at: h.at, kind: 'status', h }));
    issue.commits.forEach((c) => evts.push({ at: c.createdAt, kind: 'commit', c }));
    issue.comments.forEach((c) => evts.push({ at: c.createdAt, kind: 'comment', c }));
    return evts.sort((a, b) => new Date(a.at) - new Date(b.at));
  }, [issue]);

  return (
    <PipelineLine
      variant="timeline"
      items={entries.map((e) => ({
        dot: e.kind === 'status' ? dotForStatus(e.h.to) : e.kind === 'commit' ? 'teal' : 'azure',
        children: <ActivityEntry key={e.at + e.kind} e={e} users={users} />,
      }))}
    />
  );
}

const dotForStatus = (status) => {
  if (status === 'backlog') return 'muted';
  if (status === 'todo') return 'azure';
  if (status === 'in_progress') return 'amber';
  if (status === 'review') return 'violet';
  return 'teal';
};

function ActivityEntry({ e, users }) {
  const user = users.find((u) => u.id === (e.kind === 'status' ? e.h.by : e.kind === 'commit' ? e.c.authorId : e.c.authorId));
  if (e.kind === 'status') {
    return (
      <div className="text-[13px]">
        <span className="font-medium text-ink">{user?.name}</span>{' '}
        <span className="text-muted">
          moved this {e.h.from ? `from ${STATUS_MAP[e.h.from]?.label} to` : 'to'}{' '}
          <span className="font-semibold" style={{ color: STATUS_COLORS[e.h.to] }}>{STATUS_MAP[e.h.to]?.label}</span>
        </span>
        <span className="ml-1.5 text-xs text-muted">{timeAgo(e.h.at)}</span>
      </div>
    );
  }
  if (e.kind === 'commit') {
    return (
      <div className="text-[13px]">
        <span className="font-medium text-ink">{user?.name}</span>{' '}
        <span className="text-muted">linked commit </span>
        <code className="rounded bg-raised px-1.5 py-0.5 font-mono text-xs font-semibold text-teal">{shortSha(e.c.sha)}</code>
        <span className="ml-1 text-xs text-muted">· {timeAgo(e.c.createdAt)}</span>
        <p className="mt-0.5 text-xs text-muted">{e.c.message}</p>
      </div>
    );
  }
  return <CommentBody comment={e.c} users={users} issueId={e.issueId} />;
}

function CommentBody({ comment, users, issueId }) {
  const author = users.find((u) => u.id === comment.authorId);
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <Avatar user={author} size={24} />
        <span className="text-[13px] font-semibold text-ink">{author?.name}</span>
        <span className="text-xs text-muted">{timeAgo(comment.createdAt)}</span>
      </div>
      <div className="rounded-xl border border-line bg-card p-3">
        <RichText text={comment.body} />
        {comment.replies.map((r) => {
          const ra = users.find((u) => u.id === r.authorId);
          return (
            <div key={r.id} className="mt-3 border-t border-line pt-3">
              <div className="mb-1.5 flex items-center gap-2">
                <Avatar user={ra} size={22} />
                <span className="text-xs font-semibold text-ink">{ra?.name}</span>
                <span className="text-[11px] text-muted">{timeAgo(r.createdAt)}</span>
              </div>
              <RichText text={r.body} className="text-[13px]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CommentThread({ issue, users, addReply }) {
  const [body, setBody] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const submit = () => {
    addReply(issue.id, replyingTo, replyBody);
    setReplyBody('');
    setReplyingTo(null);
  };
  return (
    <div className="space-y-4">
      {issue.comments.length === 0 && (
        <p className="text-sm italic text-muted">No comments yet — start the thread.</p>
      )}
      {issue.comments.map((c) => (
        <div key={c.id}>
          <CommentBody comment={c} users={users} issueId={issue.id} />
          <div className="mt-1.5 pl-8">
            <button
              onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
              className="focus-ring text-xs font-medium text-muted hover:text-teal"
            >
              Reply
            </button>
          </div>
          {replyingTo === c.id && (
            <div className="ml-8 mt-2 flex gap-2">
              <Input
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder={`Reply to ${users.find((u) => u.id === c.authorId)?.name?.split(' ')[0]}…`}
                onKeyDown={(e) => e.key === 'Enter' && replyBody.trim() && submit()}
              />
              <Button size="sm" onClick={submit} disabled={!replyBody.trim()}>Reply</Button>
            </div>
          )}
        </div>
      ))}
      <div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment… (**bold**, `code`, ```code```)"
          className="focus-ring ph-muted min-h-[84px] w-full resize-y rounded-xl border border-line bg-raised px-3.5 py-2.5 text-sm text-ink"
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" icon={MessageSquare} onClick={() => { useAppStore.getState().addComment(issue.id, body); setBody(''); }} disabled={!body.trim()}>
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
}

function CommitPanel({ issue, users }) {
  const linkCommit = useAppStore((s) => s.linkCommit);
  const [linking, setLinking] = useState(false);
  const [sha, setSha] = useState('');
  const [message, setMessage] = useState('');
  const [branch, setBranch] = useState('');

  return (
    <div className="rounded-xl border border-line bg-card">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <GitCommit size={15} className="text-teal" />
          <h3 className="text-sm font-semibold text-ink">Linked commits</h3>
          <span className="font-mono text-[11px] text-muted">{issue.commits.length}</span>
        </div>
        <button
          onClick={() => { setLinking((v) => !v); setSha(randomSha()); setMessage(''); setBranch('main'); }}
          className="focus-ring flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-teal hover:bg-raised"
        >
          <Link2 size={13} /> Link commit
        </button>
      </div>
      {linking && (
        <div className="space-y-2.5 border-b border-line bg-raised-60 px-4 py-3">
          <div className="flex gap-2">
            <Input className="font-mono text-xs" value={sha} onChange={(e) => setSha(e.target.value)} placeholder="SHA (40 hex)" />
            <Input value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="branch" className="w-32" />
          </div>
          <div className="flex gap-2">
            <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Commit message" />
            <Button
              size="sm"
              disabled={!message.trim()}
              onClick={() => { linkCommit(issue.id, { sha, message, branch }); setLinking(false); }}
            >
              Link
            </Button>
          </div>
        </div>
      )}
      {issue.commits.length === 0 ? (
        <p className="px-4 py-4 text-xs italic text-muted">No commits linked yet — push or paste one above.</p>
      ) : (
        <div className="divide-y divide-line">
          {issue.commits.map((c) => {
            const author = users.find((u) => u.id === c.authorId);
            return (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg fill-teal-soft text-teal">
                  <GitCommit size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{c.message}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                    <code className="rounded bg-raised px-1.5 py-0.5 font-mono font-semibold text-teal">{shortSha(c.sha)}</code>
                    <span className="flex items-center gap-1"><GitBranch size={11} />{c.branch}</span>
                    <span>· {timeAgo(c.createdAt)}</span>
                  </div>
                </div>
                {author && <Avatar user={author} size={22} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function IssueDetailPage() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const issue = useAppStore((s) => s.issues.find((i) => i.id === issueId));
  const users = useAppStore((s) => s.users);
  const updateIssue = useAppStore((s) => s.updateIssue);
  const deleteIssue = useAppStore((s) => s.deleteIssue);
  const duplicateIssue = useAppStore((s) => s.duplicateIssue);
  const addReply = useAppStore((s) => s.addReply);
  const project = useAppStore((s) => s.projects.find((p) => p.id === issue?.projectId));
  const currentUserId = useAppStore((s) => s.currentUserId);

  const [title, setTitle] = useState(issue?.title ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const didInit = useRef(false);

  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      didInit.current = true;
    }
  }, [issue?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (issue && didInit.current && title !== issue.title) {
      const t = setTimeout(() => updateIssue(issue.id, { title }), 500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && navigate(-1);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate]);

  if (!issue) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <EmptyState icon={X} title="Issue not found" description="It may have been deleted." actionLabel="Back to board" onAction={() => navigate('/app/board')} />
      </div>
    );
  }

  const members = users.filter((u) => project?.memberIds.includes(u.id));
  const reporter = users.find((u) => u.id === issue.reporterId);
  const assignee = users.find((u) => u.id === issue.assigneeId);

  return (
    <>
      {/* Board stays mounted underneath so the context survives the slide-over */}
      <div className="pointer-events-none" aria-hidden="true">
        <Board />
      </div>
      <motion.div
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[4px]" onClick={() => navigate(-1)} />
        <motion.div
          className="absolute inset-y-0 right-0 flex w-full max-w-[680px] flex-col border-l border-line bg-card shadow-pop"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="font-mono text-sm font-bold text-teal">{issue.key}</span>
              <StatusBadge status={issue.status} />
              {issue.aiGenerated && <Badge variant="violet" size="sm"><Sparkles size={10} /> AI</Badge>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Dropdown
                align="right"
                width="w-44"
                items={[
                  { label: 'Duplicate', icon: Copy, onClick: () => duplicateIssue(issue.id) },
                  { label: 'Delete issue', icon: Trash2, danger: true, onClick: () => setConfirmDelete(true) },
                ]}
                trigger={
                  <button aria-label="Issue actions" className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-raised hover:text-ink">
                    <MoreDots />
                  </button>
                }
              />
              <button
                onClick={() => navigate(-1)}
                aria-label="Close"
                className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-raised hover:text-ink"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="focus-ring ph-muted w-full rounded-lg bg-transparent font-display text-xl font-bold text-ink"
              placeholder="Issue title"
            />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-lg bg-raised px-2.5 py-1.5 text-xs text-muted">
                <User size={12} /> Reporter: <span className="font-medium text-ink">{reporter?.name}</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-raised px-2.5 py-1.5 text-xs text-muted">
                <CalendarDays size={12} /> {timeAgo(issue.createdAt)}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <label className="mono-label mb-1.5 block">Status</label>
                <Select value={issue.status} onChange={(e) => updateIssue(issue.id, { status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </Select>
              </div>
              <div>
                <label className="mono-label mb-1.5 block">Priority</label>
                <Select value={issue.priority} onChange={(e) => updateIssue(issue.id, { priority: e.target.value })}>
                  {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </Select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="mono-label mb-1.5 block">Assignee</label>
                <Select value={issue.assigneeId ?? ''} onChange={(e) => updateIssue(issue.id, { assigneeId: e.target.value || null })}>
                  <option value="">Unassigned</option>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </Select>
              </div>
            </div>

            <div className="mt-5">
              <label className="mono-label mb-1.5 block">Labels</label>
              <div className="flex flex-wrap gap-1.5">
                {LABELS.map((l) => {
                  const on = issue.labels.includes(l);
                  return (
                    <button
                      key={l}
                      onClick={() => updateIssue(issue.id, { labels: on ? issue.labels.filter((x) => x !== l) : [...issue.labels, l] })}
                      className={cx(
                        'focus-ring rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors',
                        on ? 'fill-teal-soft text-teal' : 'bg-raised text-muted hover:text-ink'
                      )}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="mono-label mb-1.5 block">Description</label>
              <EditableDescription issue={issue} updateIssue={updateIssue} />
            </div>

            {/* Commits */}
            <div className="mt-7">
              <CommitPanel issue={issue} users={users} />
            </div>

            {/* Timeline */}
            <div className="mt-7">
              <div className="mb-4 flex items-center gap-2">
                <ChevronRight size={15} className="text-teal" />
                <h3 className="font-display text-sm font-semibold text-ink">Activity timeline</h3>
              </div>
              <ActivityTimeline issue={issue} users={users} />
            </div>

            {/* Comments */}
            <div className="mt-8">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquare size={15} className="text-teal" />
                <h3 className="font-display text-sm font-semibold text-ink">Comments</h3>
                <span className="font-mono text-[11px] text-muted">{issue.comments.length}</span>
              </div>
              <CommentThread issue={issue} users={users} addReply={addReply} />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[4px]" onClick={() => setConfirmDelete(false)} />
          <div className="card-surface relative w-full max-w-sm rounded-2xl p-6 shadow-pop">
            <h3 className="font-display text-lg font-semibold text-ink">Delete {issue.key}?</h3>
            <p className="mt-1 text-sm text-muted">This removes the issue and its history from the board. This can't be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => { deleteIssue(issue.id); setConfirmDelete(false); navigate('/app/board'); }}
              >
                Delete issue
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MoreDots() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

function EditableDescription({ issue, updateIssue }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(issue.description);
  const [mode, setMode] = useState('edit');

  useEffect(() => {
    setDraft(issue.description);
    setMode('edit');
  }, [issue.id, issue.description]);

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="focus-ring block w-full rounded-xl border border-dashed border-line bg-transparent px-4 py-3 text-left text-sm text-muted transition-colors hover:border-teal hover:text-ink"
      >
        <RichText text={issue.description} />
        <span className="mt-1 inline-block text-xs text-teal">{issue.description ? 'Edit description' : 'Add a description…'}</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-card">
      <div className="flex items-center gap-1 border-b border-line px-2 py-1.5">
        {['edit', 'preview'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cx(
              'focus-ring rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors',
              mode === m ? 'fill-raised text-ink' : 'text-muted hover:text-ink'
            )}
          >
            {m}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => { updateIssue(issue.id, { description: draft }); setEditing(false); }}
          className="focus-ring rounded-md px-2 py-1 text-xs font-medium text-teal hover:bg-raised"
        >
          Save
        </button>
        <button
          onClick={() => { setDraft(issue.description); setEditing(false); }}
          className="focus-ring rounded-md px-2 py-1 text-xs font-medium text-muted hover:bg-raised"
        >
          Cancel
        </button>
      </div>
      {mode === 'edit' ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="focus-ring ph-muted min-h-[140px] w-full resize-y bg-transparent px-4 py-3 font-mono text-[12.5px] leading-relaxed text-ink"
          placeholder="Describe the issue. Markdown: **bold**, `code`, ```fences```, - lists"
        />
      ) : (
        <div className="px-4 py-3">
          <RichText text={draft} />
        </div>
      )}
    </div>
  );
}
