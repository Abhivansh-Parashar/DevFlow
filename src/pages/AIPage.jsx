import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Check, FileText, Tag as TagIcon, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Button, PriorityBadge, Textarea, Card } from '../components/ui';
import { cx } from '../lib/utils';

const EXAMPLES = [
  'Add billing retries with exponential backoff and a webhook to notify on final failure',
  'Show a diff preview in the issue activity timeline for linked commits',
  'Rate-limit the AI generator endpoint per workspace and surface quota errors',
  'Add keyboard shortcuts to move issues between columns without dragging',
];

const STAGES = ['Parsing the request…', 'Scoping labels…', 'Setting priority…'];

function generateDraft(text) {
  const words = text.trim().split(/\s+/);
  const title = words
    .slice(0, 8)
    .join(' ')
    .replace(/^./, (c) => c.toUpperCase());
  const hasBilling = /bill|pay|stripe|invoice|charge/i.test(text);
  const hasNotif = /notif|webhook|alert|email/i.test(text);
  const labels = [hasBilling ? 'feature' : 'bug', hasNotif ? 'infra' : 'design', 'ai'].filter((l, i, a) => a.indexOf(l) === i);
  const priority = hasBilling || /critical|crash|fail|urgent|security/i.test(text) ? 'high' : /perf|speed|slow|fast/i.test(text) ? 'medium' : 'low';
  const description =
    `Generated from the request:\n> ${text}\n\n` +
    `**Acceptance criteria**\n- [ ] Behavior matches the request above\n- [ ] Covered by automated tests\n- [ ] Wired into the pipeline with a linked commit\n\n` +
    `Scope: ${labels.join(', ')} · Suggested priority: ${priority}`;
  return { title: title + (words.length > 8 ? '…' : ''), description, labels, priority };
}

export function AIPage() {
  const activeProject = useAppStore((s) => s.activeProject());
  const createIssue = useAppStore((s) => s.createIssue);
  const toast = useAppStore((s) => s.toast);

  const [text, setText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [stage, setStage] = useState(0);
  const [draft, setDraft] = useState(null);
  const [createdKey, setCreatedKey] = useState(null);

  const generate = () => {
    if (!text.trim()) {
      toast('info', 'Describe the feature request first — one or two sentences is plenty.');
      return;
    }
    setGenerating(true);
    setCreatedKey(null);
    setStage(0);
    let s = 0;
    const timer = setInterval(() => {
      s += 1;
      if (s < STAGES.length) setStage(s);
      else {
        clearInterval(timer);
        setDraft(generateDraft(text));
        setGenerating(false);
      }
    }, 700);
  };

  const confirmCreate = () => {
    if (!draft) return;
    const id = createIssue({
      projectId: activeProject.id,
      title: draft.title,
      description: draft.description,
      priority: draft.priority,
      labels: draft.labels,
      assigneeId: useAppStore.getState().currentUserId,
      status: 'backlog',
      aiGenerated: true,
    });
    if (id) {
      setCreatedKey(useAppStore.getState().issues.find((i) => i.id === id)?.key);
      setDraft(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-6">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl fill-violet-soft text-violet"><Sparkles size={18} /></span>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">AI Issue Generator</h1>
          <p className="text-sm text-muted">Describe the work in plain language — review the draft, then confirm before it touches the board.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Left: input */}
        <Card className="flex flex-col p-5">
          <label className="mono-label mb-2">Feature request</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder="e.g. Add retry logic to webhook deliveries with exponential backoff and alert on final failure…"
            className="bg-canvas"
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setText(ex)}
                className="focus-ring max-w-full truncate rounded-full border border-violet-soft fill-violet-soft px-3 py-1.5 text-left text-xs font-medium text-violet transition-colors hover:brightness-110"
              >
                {ex}
              </button>
            ))}
          </div>
          <div className="mt-4 flex-1" />
          <Button
            variant="violet"
            icon={Wand2}
            onClick={generate}
            disabled={generating}
            className="w-full"
          >
            {generating ? 'Generating…' : 'Generate draft'}
          </Button>
          {generating && (
            <div className="mt-4 space-y-2">
              {STAGES.map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span
                    className={cx(
                      'grid h-4 w-4 place-items-center rounded-full border',
                      i < stage ? 'border-violet fill-violet-soft text-violet' : i === stage ? 'border-violet' : 'border-line'
                    )}
                  >
                    {i < stage ? <Check size={10} /> : i === stage && <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 rounded-full bg-violet" />}
                  </span>
                  <span className={cx(i <= stage ? 'text-ink' : 'text-muted')}>{s}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right: preview */}
        <AnimatePresence mode="wait">
          {draft ? (
            <motion.div key="draft" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="lg:col-span-1">
              <Card className="p-5" style={{ borderColor: 'color-mix(in srgb, var(--signal-violet) 38%, transparent)' }}>
                <div className="flex items-center justify-between">
                  <span className="mono-label flex items-center gap-1.5 text-violet"><Sparkles size={11} /> AI draft · not on the board yet</span>
                  <Button variant="ghost" size="sm" onClick={generate}>Regenerate</Button>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">{draft.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <PriorityBadge priority={draft.priority} />
                  {draft.labels.map((l) => (
                    <span key={l} className="flex items-center gap-1 rounded-md fill-violet-soft px-2 py-0.5 font-mono text-[11px] font-medium text-violet">
                      <TagIcon size={10} /> {l}
                    </span>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-line bg-canvas p-3.5 text-[13px] leading-relaxed text-ink">
                  <p className="font-semibold text-ink">Acceptance criteria</p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5 text-muted">
                    <li>Behavior matches the request above</li>
                    <li>Covered by automated tests</li>
                    <li>Wired into the pipeline with a linked commit</li>
                  </ul>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="violet" icon={FileText} className="flex-1" onClick={confirmCreate}>
                    Create Issue
                  </Button>
                  <Button variant="ghost" onClick={() => setDraft(null)}>Discard</Button>
                </div>
                <p className="mt-2 text-center text-[11px] text-muted">
                  Nothing is written to the board until you confirm.
                </p>
              </Card>
            </motion.div>
          ) : createdKey ? (
            <motion.div key="created" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="flex h-full flex-col items-center justify-center p-8 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl fill-teal-soft text-teal">
                  <Check size={24} />
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">{createdKey} created</h3>
                <p className="mt-1 text-sm text-muted">It landed in Backlog, ready to move through the pipeline.</p>
                <Button className="mt-4" variant="secondary" onClick={() => useAppStore.getState().toast('success', 'Find it in the Backlog column')}>
                  Back to board
                </Button>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:col-span-1">
              <Card className="flex h-full flex-col items-center justify-center p-8 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl fill-violet-soft text-violet">
                  <Sparkles size={24} />
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">No draft yet</h3>
                <p className="mt-1 max-w-xs text-sm text-muted">
                  Write a request, hit <b>Generate draft</b>, review the structured preview, then confirm to create it.
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-violet-soft fill-violet-soft px-3 py-2 text-xs text-violet">
                  <AlertTriangle size={13} /> Drafts are never auto-created — you stay in control.
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
