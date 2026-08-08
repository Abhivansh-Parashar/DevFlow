import { useState } from 'react';
import { Modal, Field, Input, Textarea, Button } from '../ui';
import { useAppStore } from '../../store/useAppStore';
import { PROJECT_ACCENTS } from '../../lib/constants';
import { cx } from '../../lib/utils';

export function CreateProjectModal({ isOpen, onClose }) {
  const createProject = useAppStore((s) => s.createProject);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_ACCENTS[0]);
  const [repoUrl, setRepoUrl] = useState('');
  const [localRepoPath, setLocalRepoPath] = useState('');
  const [ideUrl, setIdeUrl] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createProject({ name, description, color, repoUrl, localRepoPath, ideUrl });
    onClose();
    setName('');
    setDescription('');
    setRepoUrl('');
    setLocalRepoPath('');
    setIdeUrl('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create project"
      subtitle="Projects live inside a workspace with their own member list."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!name.trim()}>Create project</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Project name" hint="Visible to workspace members only.">
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Design System" />
        </Field>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will this project track?" />
        </Field>
        <Field label="GitHub repo URL" hint="Optional — used for quick repo open from the board.">
          <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/org/repo" />
        </Field>
        <Field label="Local clone path" hint="Optional — for opening the cloned project on this PC.">
          <Input value={localRepoPath} onChange={(e) => setLocalRepoPath(e.target.value)} placeholder="C:/Users/you/dev/repo" />
        </Field>
        <Field label="IDE link" hint="Optional deep link, e.g. vscode://file/C:/Users/you/dev/repo">
          <Input value={ideUrl} onChange={(e) => setIdeUrl(e.target.value)} placeholder="vscode://file/C:/Users/you/dev/repo" />
        </Field>
        <Field label="Accent color">
          <div className="flex flex-wrap gap-2">
            {PROJECT_ACCENTS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                onClick={() => setColor(c)}
                className={cx(
                  'focus-ring h-8 w-8 rounded-lg transition-transform hover:scale-110',
                  color === c && 'ring-2 ring-offset-2 ring-offset-card'
                )}
                style={{ background: c, ...(color === c ? { boxShadow: `0 0 0 2px ${c}` } : {}) }}
              />
            ))}
          </div>
        </Field>
      </form>
    </Modal>
  );
}
