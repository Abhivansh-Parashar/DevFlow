import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Building2, Trash2, Save } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Card, Field, Input, Textarea, Button, Modal, Badge } from '../components/ui';
import { PROJECT_ACCENTS } from '../lib/constants';
import { cx } from '../lib/utils';

export function SettingsPage() {
  const activeWorkspace = useAppStore((s) => s.activeWorkspace());
  const activeProject = useAppStore((s) => s.activeProject());
  const updateWorkspace = useAppStore((s) => s.updateWorkspace);
  const updateProject = useAppStore((s) => s.updateProject);
  const deleteWorkspace = useAppStore((s) => s.deleteWorkspace);
  const toast = useAppStore((s) => s.toast);
  const role = useAppStore((s) => (s.activeWorkspace() ? s.workspaceRole(s.activeWorkspace().id) : ''));
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('◆');
  const [accent, setAccent] = useState(PROJECT_ACCENTS[0]);
  const [repoUrl, setRepoUrl] = useState('');
  const [localRepoPath, setLocalRepoPath] = useState('');
  const [ideUrl, setIdeUrl] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name);
      setDescription(activeWorkspace.description ?? '');
      setIcon(activeWorkspace.icon ?? '◆');
      setAccent(activeWorkspace.accent ?? PROJECT_ACCENTS[0]);
    }
  }, [activeWorkspace?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setRepoUrl(activeProject?.repoUrl ?? '');
    setLocalRepoPath(activeProject?.localRepoPath ?? '');
    setIdeUrl(activeProject?.ideUrl ?? '');
  }, [activeProject?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeWorkspace) return null;

  const save = () => {
    updateWorkspace(activeWorkspace.id, { name, description, icon: icon || '◆', accent });
    toast('success', 'Workspace settings saved');
  };

  const isOwner = role === 'Owner';

  const saveProjectIntegration = () => {
    if (!activeProject) return;
    updateProject(activeProject.id, {
      repoUrl: repoUrl.trim(),
      localRepoPath: localRepoPath.trim(),
      ideUrl: ideUrl.trim(),
    });
    toast('success', `Project integration saved for ${activeProject.name}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-6">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl fill-teal-soft text-teal"><Settings size={18} /></span>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Workspace settings</h1>
          <p className="text-sm text-muted">Configure {activeWorkspace.name} — scoped to this workspace.</p>
        </div>
      </div>

      <Card className="mt-6 space-y-5 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl text-lg font-bold text-white" style={{ background: accent }}>
            {icon || '◆'}
          </span>
          <div>
            <Field label="Workspace icon">
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-24 text-center" maxLength={2} />
            </Field>
          </div>
          <div className="ml-2">
            <span className="mono-label">Role</span>
            <div className="mt-1"><Badge variant={role === 'Owner' ? 'teal' : role === 'Admin' ? 'violet' : 'neutral'} dot>{role}</Badge></div>
          </div>
        </div>

        <Field label="Workspace name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Slug" hint="Used in URLs and API scoping — auto-derived, lowercase.">
          <Input value={activeWorkspace.slug} disabled className="font-mono text-xs" />
        </Field>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this workspace do?" />
        </Field>
        <Field label="Accent">
          <div className="flex flex-wrap gap-2">
            {PROJECT_ACCENTS.map((c) => (
              <button
                key={c}
                onClick={() => setAccent(c)}
                className={cx('focus-ring h-8 w-8 rounded-lg transition-transform hover:scale-110', accent === c && 'ring-2 ring-teal ring-offset-2 ring-offset-card')}
                style={{ background: c }}
                aria-label={`Accent ${c}`}
              />
            ))}
          </div>
        </Field>
        <div className="flex justify-end border-t border-line pt-4">
          <Button icon={Save} onClick={save}>Save changes</Button>
        </div>
      </Card>

      {activeProject && (
        <Card className="mt-5 space-y-4 p-5">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">Active project integration</h2>
            <p className="text-xs text-muted">Connect repository links for quick open actions from the board.</p>
          </div>
          <Field label="GitHub repository URL">
            <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/org/repo" />
          </Field>
          <Field label="Local clone path" hint="Used to open your project folder in the local IDE.">
            <Input value={localRepoPath} onChange={(e) => setLocalRepoPath(e.target.value)} placeholder="C:/Users/you/dev/repo" />
          </Field>
          <Field label="IDE deep link" hint="Optional override, e.g. vscode://file/C:/Users/you/dev/repo">
            <Input value={ideUrl} onChange={(e) => setIdeUrl(e.target.value)} placeholder="vscode://file/C:/Users/you/dev/repo" />
          </Field>
          <div className="flex justify-end border-t border-line pt-4">
            <Button onClick={saveProjectIntegration}>Save project integration</Button>
          </div>
        </Card>
      )}

      {isOwner && (
        <Card className="mt-5 p-5" style={{ borderColor: 'color-mix(in srgb, var(--signal-coral) 34%, transparent)' }}>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl fill-coral-soft text-coral"><Trash2 size={18} /></span>
            <div className="flex-1">
              <h3 className="font-display text-sm font-semibold text-ink">Danger zone</h3>
              <p className="text-xs text-muted">Deletes the workspace, its projects, issues and chat. Members lose access immediately.</p>
            </div>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>Delete workspace</Button>
          </div>
        </Card>
      )}

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Delete ${activeWorkspace.name}?`}
        subtitle="This permanently removes all projects, issues, chat history and members."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteWorkspace(activeWorkspace.id);
                setConfirmOpen(false);
                navigate('/app/board');
              }}
            >
              Delete workspace
            </Button>
          </>
        }
      >
        <p className="flex items-center gap-2 rounded-xl border border-coral-soft fill-coral-soft px-3 py-2.5 text-sm text-coral">
          <Building2 size={15} /> This cannot be undone. Consider removing members first instead.
        </p>
      </Modal>
    </div>
  );
}
