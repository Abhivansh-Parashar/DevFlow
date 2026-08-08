import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Users, FolderKanban, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Button, Textarea, Card, Badge } from '../components/ui';

const PROMPTS = [
  'What is the current project status?',
  'Who is overloaded and who has free capacity?',
  'What are the top blockers right now?',
  'What should we do in the next 48 hours?',
];

function buildSnapshot(project, issues, users, chat) {
  const scoped = issues.filter((i) => i.projectId === project.id);
  const byStatus = {
    backlog: scoped.filter((i) => i.status === 'backlog').length,
    todo: scoped.filter((i) => i.status === 'todo').length,
    inProgress: scoped.filter((i) => i.status === 'in_progress').length,
    review: scoped.filter((i) => i.status === 'review').length,
    done: scoped.filter((i) => i.status === 'done').length,
  };
  const open = scoped.filter((i) => i.status !== 'done');
  const high = open.filter((i) => i.priority === 'high');
  const stale = open.filter((i) => Date.now() - new Date(i.updatedAt).getTime() > 5 * 86_400_000);
  const commits = scoped.reduce((acc, i) => acc + i.commits.length, 0);
  const messageCount = (chat[project.id] ?? []).length;
  const memberStats = project.memberIds
    .map((id) => {
      const user = users.find((u) => u.id === id);
      const assignedOpen = open.filter((i) => i.assigneeId === id).length;
      return { id, name: user?.name ?? id, assignedOpen };
    })
    .sort((a, b) => b.assignedOpen - a.assignedOpen);
  return { scoped, byStatus, open, high, stale, commits, messageCount, memberStats };
}

function answer(question, project, snapshot) {
  const q = question.toLowerCase();
  const topMember = snapshot.memberStats[0];
  const lightMember = snapshot.memberStats[snapshot.memberStats.length - 1];
  const blockers = snapshot.high.slice(0, 3).map((i) => i.key).join(', ');

  if (q.includes('status') || q.includes('health') || q.includes('progress')) {
    return `Project ${project.name} has ${snapshot.open.length} open and ${snapshot.byStatus.done} done issues. In progress: ${snapshot.byStatus.inProgress}, in review: ${snapshot.byStatus.review}, backlog: ${snapshot.byStatus.backlog}. Linked commits so far: ${snapshot.commits}.`;
  }
  if (q.includes('overload') || q.includes('capacity') || q.includes('team') || q.includes('member')) {
    return `${topMember?.name ?? 'Team lead'} currently carries the highest load (${topMember?.assignedOpen ?? 0} open issues). ${lightMember?.name ?? 'Another member'} has the lightest load (${lightMember?.assignedOpen ?? 0} open issues), so they are the best handoff candidate.`;
  }
  if (q.includes('blocker') || q.includes('risk') || q.includes('urgent')) {
    if (!snapshot.high.length && !snapshot.stale.length) {
      return 'No critical blockers detected right now. Keep the review queue flowing and pull from backlog by priority.';
    }
    return `Top blockers: ${blockers || 'none'}. There are ${snapshot.stale.length} stale open issues older than 5 days. Recommend triaging high-priority items first and assigning a clear owner per blocker.`;
  }
  if (q.includes('next') || q.includes('plan') || q.includes('48')) {
    return `Next 48h plan: 1) move ${snapshot.byStatus.review} review items to done, 2) pull 2 high-priority backlog items into todo, 3) resolve stale issues (${snapshot.stale.length}) with owner + deadline, 4) keep chat updates short and link commits to issue keys.`;
  }
  return `I can help with project status, team workload, blockers, and next-step planning for ${project.name}. Ask me something like "top blockers" or "who has capacity".`;
}

export function AIPage() {
  const activeProject = useAppStore((s) => s.activeProject());
  const issues = useAppStore((s) => s.issues);
  const users = useAppStore((s) => s.users);
  const chat = useAppStore((s) => s.chat);
  const currentUser = useAppStore((s) => s.currentUser());
  const toast = useAppStore((s) => s.toast);

  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const scrollRef = useRef(null);

  // Keep the newest exchange in view — the panel has a fixed height, so a long
  // thread scrolls instead of overflowing the screen.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history.length]);

  const snapshot = useMemo(
    () => (activeProject ? buildSnapshot(activeProject, issues, users, chat) : null),
    [activeProject, issues, users, chat]
  );

  const ask = (input = question) => {
    const text = input.trim();
    if (!text) {
      toast('info', 'Ask the assistant about status, blockers, team load, or next steps.');
      return;
    }
    if (!activeProject || !snapshot) return;
    const reply = answer(text, activeProject, snapshot);
    setHistory((prev) => [...prev, { role: 'user', text }, { role: 'assistant', text: reply }]);
    setQuestion('');
  };

  if (!activeProject) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Card className="p-6">
          <h1 className="font-display text-xl font-bold text-ink">AI Assistant</h1>
          <p className="mt-2 text-sm text-muted">Select a project first. The assistant is project-scoped and responds from your active board context.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl fill-violet-soft text-violet"><Sparkles size={18} /></span>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">AI Project Assistant</h1>
          <p className="text-sm text-muted">Ask about team capacity, blockers, and project progress from live workspace data.</p>
        </div>
        <div className="flex-1" />
        <Badge variant="violet" dot>Scoped to {activeProject.name}</Badge>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_1.4fr]">
        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <FolderKanban size={15} className="text-teal" /> Project snapshot
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-line bg-raised px-3 py-2">Open: <b>{snapshot.open.length}</b></div>
            <div className="rounded-lg border border-line bg-raised px-3 py-2">Done: <b>{snapshot.byStatus.done}</b></div>
            <div className="rounded-lg border border-line bg-raised px-3 py-2">High priority: <b>{snapshot.high.length}</b></div>
            <div className="rounded-lg border border-line bg-raised px-3 py-2">Stale: <b>{snapshot.stale.length}</b></div>
          </div>
          <div className="rounded-xl border border-line bg-card p-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink"><Users size={13} /> Team load</p>
            <div className="space-y-1.5">
              {snapshot.memberStats.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center justify-between text-[12px]">
                  <span className="truncate text-muted">{m.name}</span>
                  <span className="font-mono font-semibold text-ink">{m.assignedOpen} open</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="mono-label">Quick prompts</p>
            <div className="flex flex-wrap gap-1.5">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => ask(p)}
                  className="focus-ring rounded-full border border-violet-soft fill-violet-soft px-3 py-1.5 text-xs font-medium text-violet transition-colors hover:brightness-110"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="flex h-[calc(100vh-11rem)] min-h-[460px] flex-col p-5">
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain">
            {history.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-violet-soft fill-violet-soft p-4 text-sm text-violet">
                Ask your first question. I can summarize status, spot risk, and suggest immediate execution steps for this project.
              </motion.div>
            )}
            {history.map((m, idx) => (
              <motion.div
                key={`${m.role}-${idx}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={m.role === 'user' ? 'ml-auto max-w-[85%] rounded-2xl rounded-br-sm border border-teal bg-teal px-3.5 py-2.5 text-sm text-white' : 'max-w-[88%] rounded-2xl rounded-bl-sm border border-line bg-card px-3.5 py-2.5 text-sm text-ink'}
              >
                {m.text}
              </motion.div>
            ))}
          </div>

          <div className="mt-4 border-t border-line pt-3">
            <div className="flex items-end gap-2.5">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={2}
                placeholder={`Ask about ${activeProject.name}…`}
                className="bg-canvas"
                style={{ resize: 'none', height: 62, minHeight: 62, maxHeight: 62 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    ask();
                  }
                }}
              />
              <Button icon={Send} onClick={() => ask()} disabled={!question.trim()}>Send</Button>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
              <CheckCircle2 size={13} className="text-teal" />
              Uses active project issues, status distribution, and team assignments.
              <AlertTriangle size={13} className="ml-2 text-amber" />
              Suggestions are advisory.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
