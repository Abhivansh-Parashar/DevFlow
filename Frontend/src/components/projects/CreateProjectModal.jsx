import { useState } from 'react';
import { Modal, Field, Input, Textarea, Button } from '../ui';
import { useAppStore } from '../../store/useAppStore';
import { PROJECT_ACCENTS } from '../../lib/constants';
import { projectService } from '../../lib/api/services';
import { cx } from '../../lib/utils';

export function CreateProjectModal({ isOpen, onClose }) {
  const activeWorkspace = useAppStore((s) => s.activeWorkspace());
  const toast = useAppStore((s) => s.toast);
  const createProject = useAppStore((s) => s.createProject);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_ACCENTS[0]);
  const [repoUrl, setRepoUrl] = useState('');
  const [localRepoPath, setLocalRepoPath] = useState('');
  const [ideUrl, setIdeUrl] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!activeWorkspace || saving) return;
    setSaving(true); setError('');
    try {
      if (!/^\d+$/.test(String(activeWorkspace.id))) {
        createProject({ name, description, color, repoUrl, localRepoPath, ideUrl });
        onClose();
        return;
      }
      const project = await projectService.create(activeWorkspace.id, { name, repoUrl: repoUrl || undefined });
      useAppStore.setState((state) => ({ projects: [...state.projects, { ...project, color, icon: '#', memberIds: [state.currentUserId], roles: { [state.currentUserId]: 'Owner' } }], activeProjectId: project.id }));
      toast('success', 'Project created'); onClose();
    } catch (err) { setError(err.message || 'Unable to create project.'); } finally { setSaving(false); }
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
          <Button onClick={submit} disabled={!name.trim() || saving}>{saving ? 'Creating?' : 'Create project'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="rounded-lg border border-coral-soft px-3 py-2 text-xs text-coral">{error}</p>}
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
