import { useState } from 'react';
import { Users, UserPlus, Building2, FolderKanban, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Avatar, Badge, Button, Dropdown, EmptyState, Modal } from '../components/ui';
import { WORKSPACE_ROLES, PROJECT_ROLES } from '../lib/constants';
import { cx, timeAgo } from '../lib/utils';

export function MembersPage() {
  const activeWorkspace = useAppStore((s) => s.activeWorkspace());
  const activeProject = useAppStore((s) => s.activeProject());
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const [tab, setTab] = useState('project');
  const [addOpen, setAddOpen] = useState(false);

  const isWorkspace = tab === 'workspace';
  // Note: computed before the early return to keep hook order stable.
  const canManage = useAppStore((s) =>
    isWorkspace
      ? s.canManageMembers('workspace', activeWorkspace?.id)
      : s.canManageMembers('project', activeProject?.id)
  );

  if (!activeWorkspace) return null;

  const memberIds = isWorkspace ? activeWorkspace.memberIds : (activeProject?.memberIds ?? []);
  const roleOf = isWorkspace
    ? activeWorkspace.roles
    : (activeProject?.roles ?? {});

  return (
    <div className="mx-auto max-w-4xl px-5 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Members</h1>
          <p className="text-sm text-muted">
            {isWorkspace ? `Everyone in ${activeWorkspace.name}` : `Access is scoped to ${activeProject?.name} — a workspace subset.`}
          </p>
        </div>
        <div className="flex-1" />
        {canManage && (
          <Button icon={UserPlus} onClick={() => setAddOpen(true)}>Add member</Button>
        )}
      </div>

      <div className="mt-5 flex gap-1 rounded-xl bg-raised p-1">
        {[
          { id: 'project', label: `Project · ${activeProject?.name ?? ''}`, icon: FolderKanban },
          { id: 'workspace', label: 'Workspace', icon: Building2 },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cx(
              'focus-ring flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
              tab === t.id ? 'bg-card text-ink shadow-soft' : 'text-muted hover:text-ink'
            )}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {!canManage && (
        <p className="mt-3 flex items-center gap-2 rounded-lg border border-amber-soft fill-amber-soft px-3 py-2 text-xs text-amber">
          <ShieldCheck size={14} /> Only Owner/Admin can manage members — you can view.
        </p>
      )}

      <div className="card-surface mt-5 overflow-hidden rounded-xl">
        <div className="divide-y divide-line">
          {memberIds.length === 0 && (
            <EmptyState compact icon={Users} title="No members" description="Add members to get the team moving." />
          )}
          {memberIds.map((uid) => {
            const u = users.find((x) => x.id === uid);
            if (!u) return null;
            const role = roleOf[uid] ?? 'Member';
            const isMe = uid === currentUserId;
            const canChange = canManage && !isMe;
            return (
              <div key={uid} className="flex items-center gap-3 px-4 py-3">
                <Avatar user={u} size={36} showStatus />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {u.name} {isMe && <span className="ml-1 text-xs font-normal text-muted">(you)</span>}
                  </p>
                  <p className="truncate font-mono text-xs text-muted">{u.email}</p>
                </div>
                <RoleBadge role={role} />
                {canChange ? (
                  <RoleDropdown scope={isWorkspace ? 'workspace' : 'project'} scopeId={isWorkspace ? activeWorkspace.id : activeProject.id} userId={uid} role={role} roles={isWorkspace ? WORKSPACE_ROLES : PROJECT_ROLES} />
                ) : (
                  <span className="w-32" />
                )}
                {canChange ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-coral hover:fill-coral-soft"
                    onClick={() => {
                      if (isWorkspace) useAppStore.getState().removeWorkspaceMember(activeWorkspace.id, uid);
                      else useAppStore.getState().removeProjectMember(activeProject.id, uid);
                    }}
                  >
                    Remove
                  </Button>
                ) : (
                  <span className="w-16" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AddMemberModal isOpen={addOpen} onClose={() => setAddOpen(false)} workspace={isWorkspace} />
    </div>
  );
}

function RoleBadge({ role }) {
  const variant = role === 'Owner' ? 'teal' : role === 'Admin' ? 'violet' : 'neutral';
  return <Badge variant={variant} dot>{role}</Badge>;
}

function RoleDropdown({ scope, scopeId, userId, role, roles }) {
  const setRole = useAppStore((s) => (scope === 'workspace' ? s.setWorkspaceRole : s.setProjectRole));
  return (
    <Dropdown
      width="w-36"
      items={roles.map((r) => ({
        label: r,
        checked: r === role,
        onClick: () => setRole(scopeId, userId, r),
      }))}
      trigger={
        <button className="focus-ring flex w-32 items-center justify-between gap-1 rounded-lg border border-line bg-raised px-2.5 py-1.5 text-xs font-medium text-ink hover:border-teal">
          {role}
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
        </button>
      }
    />
  );
}

function AddMemberModal({ isOpen, onClose, workspace }) {
  const activeWorkspace = useAppStore((s) => s.activeWorkspace());
  const activeProject = useAppStore((s) => s.activeProject());
  const users = useAppStore((s) => s.users);
  const addWorkspaceMember = useAppStore((s) => s.addWorkspaceMember);
  const addProjectMember = useAppStore((s) => s.addProjectMember);

  if (!isOpen) return null;

  // Scope the candidate pool to enforce the parent-workspace boundary.
  const candidates = users.filter((u) => {
    if (workspace) return !activeWorkspace.memberIds.includes(u.id);
    return activeWorkspace.memberIds.includes(u.id) && !activeProject.memberIds.includes(u.id);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={workspace ? 'Add workspace member' : `Add member from ${activeWorkspace.name}`}
      subtitle={workspace ? 'They will see every project in the workspace.' : 'Only workspace members can be added — project access stays a strict subset.'}
    >
      {candidates.length === 0 ? (
        <EmptyState compact icon={UserPlus} title="No candidates" description={workspace ? 'All users are already members.' : 'Every workspace member is already on this project.'} />
      ) : (
        <div className="max-h-[360px] space-y-1 overflow-y-auto">
          {candidates.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-raised">
              <Avatar user={u} size={32} showStatus />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{u.name}</p>
                <p className="truncate font-mono text-xs text-muted">{u.email}</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (workspace) {
                    if (addWorkspaceMember(activeWorkspace.id, u.id)) onClose();
                  } else if (addProjectMember(activeProject.id, u.id)) {
                    onClose();
                  }
                }}
              >
                Add
              </Button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
