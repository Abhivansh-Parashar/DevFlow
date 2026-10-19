import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { Modal, Field, Input, Button } from '../ui';
import { workspaceService } from '../../lib/api/services';
import { useAppStore } from '../../store/useAppStore';

export function CreateWorkspaceModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useAppStore((s) => s.toast);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    setError('');
    try {
      const workspace = await workspaceService.create({ name: name.trim() });
      const normalized = {
        ...workspace,
        id: String(workspace.id),
        memberIds: (workspace.memberIds || []).map(String),
        roles: Object.fromEntries(Object.entries(workspace.roles || {}).map(([id, role]) => [String(id), role.replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())])),
      };
      useAppStore.setState((state) => ({
        workspaces: [...state.workspaces.filter((item) => item.id !== normalized.id), normalized],
        activeWorkspaceId: normalized.id,
        activeProjectId: null,
      }));
      toast('success', `Workspace "${normalized.name}" created`);
      setName('');
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to create workspace.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create workspace"
      subtitle="Create a shared home for your team, projects, and delivery flow."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon={Building2} onClick={submit} disabled={!name.trim() || saving}>{saving ? 'Creating…' : 'Create workspace'}</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="rounded-lg border border-coral-soft px-3 py-2 text-xs text-coral">{error}</p>}
        <Field label="Workspace name" hint="Use your team, company, or product name.">
          <Input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Northstar Labs" />
        </Field>
      </form>
    </Modal>
  );
}
