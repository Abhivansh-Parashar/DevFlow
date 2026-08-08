import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SlideOverPanel, Field, Input, Textarea, Select, Button, Avatar } from '../ui';
import { STATUSES, PRIORITIES, LABELS } from '../../lib/constants';
import { cx } from '../../lib/utils';

export function NewIssueSlideOver({ isOpen, onClose, initialStatus = 'backlog', project, members }) {
  const createIssue = useAppStore((s) => s.createIssue);
  const currentUserId = useAppStore((s) => s.currentUserId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [labels, setLabels] = useState([]);
  const [assigneeId, setAssigneeId] = useState(currentUserId);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setLabels([]);
      setAssigneeId(currentUserId);
      setStatus(initialStatus);
    }
  }, [isOpen, initialStatus, currentUserId]);

  const submit = () => {
    const id = createIssue({
      projectId: project.id,
      title,
      description,
      priority,
      labels,
      assigneeId: assigneeId || null,
      status,
    });
    if (id) onClose();
  };

  return (
    <SlideOverPanel
      isOpen={isOpen}
      onClose={onClose}
      title="New issue"
      subtitle={`${project?.keyPrefix}-* in ${project?.name}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!title.trim()}>Create issue</Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Title">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fix flaky board drag on touch devices"
            onKeyDown={(e) => e.key === 'Enter' && title.trim() && submit()}
          />
        </Field>
        <Field label="Description" hint="Markdown supported — **bold**, `code`, ```fences```.">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue, acceptance criteria…" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Assignee">
          <Select value={assigneeId ?? ''} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Labels">
          <div className="flex flex-wrap gap-1.5">
            {LABELS.map((l) => {
              const on = labels.includes(l);
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLabels((prev) => (on ? prev.filter((x) => x !== l) : [...prev, l]))}
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
        </Field>

        <div className="rounded-xl border border-line bg-raised p-3.5">
          <div className="flex items-center gap-2.5">
            {members.find((m) => m.id === assigneeId) && <Avatar user={members.find((m) => m.id === assigneeId)} size={26} />}
            <div className="text-[13px]">
              <p className="font-medium text-ink">{assigneeId ? members.find((m) => m.id === assigneeId)?.name : 'Unassigned'}</p>
              <p className="text-xs text-muted">will be created by you as {project?.keyPrefix}-next</p>
            </div>
          </div>
        </div>
      </div>
    </SlideOverPanel>
  );
}
