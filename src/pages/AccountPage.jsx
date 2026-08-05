import { useEffect, useRef, useState } from 'react';
import { UserRound, Save, Palette, AtSign, Building2, Camera, LogOut, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Card, Field, Input, Button, Toggle, Avatar, Badge, Modal, WorkspaceLogo } from '../components/ui';
import { AVATAR_COLORS } from '../lib/constants';
import { cx } from '../lib/utils';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

/**
 * Personal account settings — profile photo, name, email, avatar color and
 * presence, plus workspace memberships you can leave. Opened from the user
 * card at the bottom-left of the sidebar.
 */
export function AccountPage() {
  const currentUser = useAppStore((s) => s.currentUser());
  const updateUser = useAppStore((s) => s.updateUser);
  const leaveWorkspace = useAppStore((s) => s.leaveWorkspace);
  const workspaces = useAppStore((s) => s.workspaces);
  const toast = useAppStore((s) => s.toast);

  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [color, setColor] = useState(currentUser?.color ?? '');
  const [online, setOnline] = useState(!!currentUser?.online);
  const [avatar, setAvatar] = useState(currentUser?.avatar ?? '');
  const [photoUrl, setPhotoUrl] = useState('');
  const [leaveTarget, setLeaveTarget] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setColor(currentUser.color);
      setOnline(!!currentUser.online);
      setAvatar(currentUser.avatar ?? '');
    }
  }, [currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentUser) return null;

  const previewUser = { ...currentUser, name: name.trim() || currentUser.name, color, avatar };

  const save = () => {
    if (!name.trim()) {
      toast('error', 'Name cannot be empty');
      return;
    }
    updateUser(currentUser.id, {
      name: name.trim(),
      email: email.trim() || currentUser.email,
      color,
      online,
      avatar,
    });
    toast('success', 'Account settings saved');
  };

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('error', 'Please choose an image file');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast('error', 'Photo must be under 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setPhotoUrl('');
    };
    reader.readAsDataURL(file);
  };

  const applyPhotoUrl = () => {
    const url = photoUrl.trim();
    if (!url) {
      toast('info', 'Paste an image URL first');
      return;
    }
    setAvatar(url);
  };

  const confirmLeave = () => {
    if (!leaveTarget) return;
    const id = leaveTarget.id;
    setLeaveTarget(null);
    leaveWorkspace(id);
  };

  const memberships = workspaces.filter((w) => w.memberIds.includes(currentUser.id));

  return (
    <div className="mx-auto max-w-2xl px-5 py-6">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl fill-teal-soft text-teal"><UserRound size={18} /></span>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Account settings</h1>
          <p className="text-sm text-muted">Your personal profile — visible across every workspace.</p>
        </div>
      </div>

      <Card className="mt-6 space-y-5 p-5">
        <div className="flex items-center gap-4">
          <Avatar user={previewUser} size={56} showStatus />
          <div className="min-w-0">
            <p className="font-display text-base font-semibold text-ink">{previewUser.name}</p>
            <p className="truncate text-xs text-muted">{previewUser.email}</p>
          </div>
        </div>

        <Field label="Profile photo" hint="Upload a photo or paste an image URL — it replaces the initials everywhere.">
          <div className="flex flex-wrap items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} aria-label="Upload profile photo" />
            <Button variant="secondary" size="sm" icon={Camera} onClick={() => fileRef.current?.click()}>
              Upload photo
            </Button>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.png"
                className="h-9"
              />
              <Button size="sm" onClick={applyPhotoUrl}>Use URL</Button>
            </div>
            {avatar && (
              <button
                onClick={() => {
                  setAvatar('');
                  setPhotoUrl('');
                }}
                className="focus-ring flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-coral transition-colors hover:bg-raised"
              >
                <Trash2 size={13} /> Remove
              </button>
            )}
          </div>
        </Field>

        <Field label="Display name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={40} />
        </Field>
        <Field label="Email" hint="Used for sign-in and mentions.">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.dev" maxLength={80} />
        </Field>

        <Field label="Avatar color">
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cx(
                  'focus-ring h-9 w-9 rounded-full transition-transform hover:scale-110',
                  color === c && 'ring-2 ring-teal ring-offset-2 ring-offset-card'
                )}
                style={{ background: c }}
                aria-label={`Avatar color ${c}`}
              />
            ))}
          </div>
        </Field>

        <div className="flex items-center justify-between rounded-xl border border-line bg-raised px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Palette size={15} className="text-teal" />
            <div>
              <p className="text-[13px] font-semibold text-ink">Online presence</p>
              <p className="text-xs text-muted">Show the green dot on your avatar across the app.</p>
            </div>
          </div>
          <Toggle checked={online} onChange={setOnline} aria-label="Online presence" />
        </div>

        <div className="flex justify-end border-t border-line pt-4">
          <Button icon={Save} onClick={save}>Save changes</Button>
        </div>
      </Card>

      <Card className="mt-5 p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <Building2 size={15} className="text-teal" /> Your workspaces
        </p>
        <div className="space-y-2">
          {memberships.map((w) => {
            const role = w.roles[currentUser.id] ?? 'Member';
            return (
              <div key={w.id} className="flex items-center gap-3 rounded-xl border border-line bg-card px-3 py-2.5">
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"
                  style={{ background: w.accent }}
                >
                  <WorkspaceLogo id={w.icon} size={16} fallback={w.icon ?? '◆'} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink">{w.name}</p>
                  <p className="font-mono text-[10px] text-muted">{w.slug}</p>
                </div>
                <Badge variant={role === 'Owner' ? 'teal' : role === 'Admin' ? 'violet' : 'neutral'} dot>{role}</Badge>
                <button
                  onClick={() => setLeaveTarget(w)}
                  className="focus-ring flex shrink-0 items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[12px] font-medium text-muted transition-colors hover:border-coral-soft hover:bg-raised hover:text-coral"
                >
                  <LogOut size={13} /> Leave
                </button>
              </div>
            );
          })}
          {memberships.length === 0 && (
            <div className="rounded-xl border border-line bg-raised px-4 py-6 text-center text-sm text-muted">
              You're not part of any workspace yet — accept an invite or create one from the sidebar.
            </div>
          )}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
          <AtSign size={12} /> Mentioned as @{currentUser.name.toLowerCase().replace(/\s+/g, '.')} in chat.
        </p>
      </Card>

      <Modal
        isOpen={!!leaveTarget}
        onClose={() => setLeaveTarget(null)}
        title={`Leave ${leaveTarget?.name ?? 'workspace'}?`}
        subtitle="You'll lose access to its projects, boards and chat."
        footer={
          <>
            <Button variant="ghost" onClick={() => setLeaveTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmLeave}>Leave workspace</Button>
          </>
        }
      >
        <p className="flex items-center gap-2 rounded-xl border border-coral-soft fill-coral-soft px-3 py-2.5 text-sm text-coral">
          <Trash2 size={15} /> This can't be undone by you. If you're the owner, ownership transfers to the next member.
        </p>
      </Modal>
    </div>
  );
}
