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

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createProject({ name, description, color });
    onClose();
    setName('');
    setDescription('');
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
