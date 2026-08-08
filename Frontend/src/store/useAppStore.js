import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  seedUsers,
  seedWorkspaces,
  seedProjects,
  seedIssues,
  seedChat,
  seedNotifications,
  seedReactions,
  seedInvites,
} from '../data/seed';
import { uid, randomSha } from '../lib/utils';
import { PROJECT_ACCENTS } from '../lib/constants';
import { simulateChat, maybeSimulateCommentReply, maybeSimulateCommit } from '../lib/realtime';

const pickAccent = () => PROJECT_ACCENTS[Math.floor(Math.random() * PROJECT_ACCENTS.length)];

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ---- persisted preferences ----
      theme: 'brutal',
      signedIn: false,
      currentUserId: null,
      activeWorkspaceId: null,
      activeProjectId: null,

      // ---- session data (re-seeded per load) ----
      users: seedUsers,
      workspaces: seedWorkspaces,
      projects: seedProjects,
      issues: seedIssues,
      chat: seedChat,
      notifications: seedNotifications,
      reactions: seedReactions,
      invites: seedInvites,
      toasts: [],
      typing: {},
      searchOpen: false,

      // ---- derived helpers ----
      currentUser: () => get().users.find((u) => u.id === get().currentUserId) ?? null,
      activeWorkspace: () => get().workspaces.find((w) => w.id === get().activeWorkspaceId) ?? null,
      activeProject: () => get().projects.find((p) => p.id === get().activeProjectId) ?? null,
      workspaceRole: (workspaceId) =>
        (get().workspaces.find((w) => w.id === workspaceId)?.roles ?? {})[get().currentUserId] ?? 'Member',
      projectRole: (projectId) =>
        (get().projects.find((p) => p.id === projectId)?.roles ?? {})[get().currentUserId] ?? 'Member',
      canManageMembers: (scope, id) => {
        const role = scope === 'workspace' ? get().workspaceRole(id) : get().projectRole(id);
        return role === 'Owner' || role === 'Admin';
      },

      // ---- theme & session ----
      setTheme: (theme) => set({ theme }),
      // Two themes: dark ↔ brutal (soft-brutalist).
      toggleTheme: () =>
        set((s) => {
          const current = s.theme === 'light' ? 'dark' : s.theme;
          return { theme: current === 'dark' ? 'brutal' : 'dark' };
        }),
      signIn: (email) =>
        set((s) => {
          const match = s.users.find(
            (u) => u.email.toLowerCase() === String(email || '').trim().toLowerCase()
          );
          return { signedIn: true, currentUserId: match?.id ?? 'u1' };
        }),
      signOut: () => set({ signedIn: false, currentUserId: null }),
      updateUser: (id, patch) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),

      setActiveWorkspace: (id) =>
        set((s) => {
          const firstProject = s.projects.find(
            (p) => p.workspaceId === id && p.memberIds.includes(s.currentUserId)
          );
          return { activeWorkspaceId: id, activeProjectId: firstProject?.id ?? null };
        }),
      setActiveProject: (id) => set({ activeProjectId: id }),

      openSearch: () => set({ searchOpen: true }),
      closeSearch: () => set({ searchOpen: false }),

      // ---- toasts ----
      toast: (type, message) => {
        const id = uid('toast');
        set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4600);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      // ---- workspaces & projects ----
      createWorkspace: ({ name, icon = 'hexagon' }) => {
        if (!name.trim()) {
          get().toast('error', 'Workspace needs a name');
          return;
        }
        const id = uid('ws');
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const ws = {
          id,
          name: name.trim(),
          slug,
          icon,
          accent: pickAccent(),
          memberIds: [get().currentUserId],
          roles: { [get().currentUserId]: 'Owner' },
        };
        set((s) => ({ workspaces: [...s.workspaces, ws], activeWorkspaceId: id, activeProjectId: null }));
        get().toast('success', `Workspace "${name.trim()}" created`);
      },

      createProject: ({ name, description = '', color, icon = '#', repoUrl = '', localRepoPath = '', ideUrl = '' }) => {
        if (!name.trim()) {
          get().toast('error', 'Project needs a name');
          return;
        }
        const wsId = get().activeWorkspaceId;
        const me = get().currentUserId;
        const id = uid('p');
        const project = {
          id,
          workspaceId: wsId,
          name: name.trim(),
          description: description.trim(),
          repoUrl: repoUrl.trim(),
          localRepoPath: localRepoPath.trim(),
          ideUrl: ideUrl.trim(),
          color: color ?? pickAccent(),
          icon,
          keyPrefix: (name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'PRJ'),
          memberIds: [me],
          roles: { [me]: 'Owner' },
        };
        set((s) => ({ projects: [...s.projects, project], activeProjectId: id }));
        get().toast('success', `Project "${name.trim()}" created`);
      },

      updateWorkspace: (id, patch) =>
        set((s) => ({ workspaces: s.workspaces.map((w) => (w.id === id ? { ...w, ...patch } : w)) })),

      updateProject: (id, patch) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

      deleteWorkspace: (id) => {
        const ws = get().workspaces.find((w) => w.id === id);
        const projectIds = get()
          .projects.filter((p) => p.workspaceId === id)
          .map((p) => p.id);
        set((s) => ({
          workspaces: s.workspaces.filter((w) => w.id !== id),
          projects: s.projects.filter((p) => p.workspaceId !== id),
          issues: s.issues.filter((i) => !projectIds.includes(i.projectId)),
          chat: Object.fromEntries(Object.entries(s.chat).filter(([pid]) => !projectIds.includes(pid))),
          notifications: s.notifications.filter((n) => !projectIds.includes(n.projectId)),
        }));
        const remaining = get().workspaces;
        if (remaining.length) get().setActiveWorkspace(remaining[0].id);
        get().toast('info', `Workspace "${ws?.name}" deleted`);
      },

      // ---- issues ----
      nextIssueKey: (project) => {
        const nums = get()
          .issues.filter((i) => i.projectId === project.id)
          .map((i) => Number(i.key.split('-')[1] ?? 0));
        const max = nums.length ? Math.max(...nums) : 0;
        return `${project.keyPrefix}-${String(max + 1).padStart(3, '0')}`;
      },

      createIssue: ({ projectId, title, description = '', priority = 'medium', labels = [], assigneeId = null, status = 'backlog', aiGenerated = false }) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project || !title.trim()) {
          get().toast('error', 'Issue needs a title');
          return null;
        }
        const id = uid('i');
        const now = new Date().toISOString();
        const issue = {
          id,
          key: get().nextIssueKey(project),
          workspaceId: project.workspaceId,
          projectId,
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          labels,
          assigneeId,
          reporterId: get().currentUserId,
          createdAt: now,
          updatedAt: now,
          aiGenerated,
          comments: [],
          commits: [],
          statusHistory: [{ from: null, to: status, by: get().currentUserId, at: now }],
        };
        set((s) => ({ issues: [...s.issues, issue] }));
        get().toast('success', `Issue ${issue.key} created`);
        return issue.id;
      },

      updateIssue: (id, patch) =>
        set((s) => ({
          issues: s.issues.map((i) => {
            if (i.id !== id) return i;
            const statusHistory =
              patch.status !== undefined && patch.status !== i.status
                ? [...i.statusHistory, { from: i.status, to: patch.status, by: get().currentUserId, at: new Date().toISOString() }]
                : i.statusHistory;
            return { ...i, ...patch, statusHistory, updatedAt: new Date().toISOString() };
          }),
        })),

      moveIssue: (id, status) => get().updateIssue(id, { status }),

      deleteIssue: (id) => {
        const issue = get().issues.find((i) => i.id === id);
        set((s) => ({ issues: s.issues.filter((i) => i.id !== id) }));
        if (issue) get().toast('info', `Issue ${issue.key} deleted`);
      },

      duplicateIssue: (id) => {
        const src = get().issues.find((i) => i.id === id);
        if (!src) return;
        const project = get().projects.find((p) => p.id === src.projectId);
        const now = new Date().toISOString();
        const copy = {
          ...src,
          id: uid('i'),
          key: get().nextIssueKey(project),
          title: `${src.title} (copy)`,
          description: src.description,
          status: 'backlog',
          comments: [],
          commits: [],
          reporterId: get().currentUserId,
          createdAt: now,
          updatedAt: now,
          aiGenerated: false,
          statusHistory: [{ from: null, to: 'backlog', by: get().currentUserId, at: now }],
        };
        set((s) => ({ issues: [...s.issues, copy] }));
        get().toast('success', `Duplicated as ${copy.key}`);
        return copy.id;
      },

      // ---- comments ----
      addComment: (issueId, body) => {
        if (!body.trim()) return;
        const comment = {
          id: uid('c'),
          authorId: get().currentUserId,
          body: body.trim(),
          createdAt: new Date().toISOString(),
          replies: [],
        };
        set((s) => ({
          issues: s.issues.map((i) =>
            i.id === issueId ? { ...i, comments: [...i.comments, comment], updatedAt: new Date().toISOString() } : i
          ),
        }));
        maybeSimulateCommentReply(get, set, issueId);
      },
      addReply: (issueId, commentId, body) => {
        if (!body.trim()) return;
        set((s) => ({
          issues: s.issues.map((i) =>
            i.id !== issueId
              ? i
              : {
                  ...i,
                  comments: i.comments.map((c) =>
                    c.id === commentId
                      ? {
                          ...c,
                          replies: [
                            ...c.replies,
                            { id: uid('cr'), authorId: get().currentUserId, body: body.trim(), createdAt: new Date().toISOString() },
                          ],
                        }
                      : c
                  ),
                  updatedAt: new Date().toISOString(),
                }
          ),
        }));
      },

      // ---- commits ----
      linkCommit: (issueId, { sha, message, branch }) => {
        const issue = get().issues.find((i) => i.id === issueId);
        if (!issue || !message.trim()) {
          get().toast('error', 'Commit needs a message');
          return;
        }
        const commit = {
          id: uid('cm'),
          sha: sha || randomSha(),
          message: message.trim(),
          branch: branch?.trim() || 'main',
          authorId: get().currentUserId,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          issues: s.issues.map((i) =>
            i.id === issueId ? { ...i, commits: [...i.commits, commit], updatedAt: new Date().toISOString() } : i
          ),
        }));
        get().toast('success', `Commit ${commit.sha.slice(0, 7)} linked to ${issue.key}`);
      },

      // ---- chat ----
      sendChat: (projectId, body, opts = {}) => {
        const text = String(body ?? '').trim();
        if (!text && !opts.sticker) return;
        const msg = {
          id: uid('m'),
          projectId,
          authorId: get().currentUserId,
          body: text,
          createdAt: new Date().toISOString(),
        };
        if (opts.sticker) msg.sticker = opts.sticker;
        set((s) => ({ chat: { ...s.chat, [projectId]: [...(s.chat[projectId] ?? []), msg] } }));
        const project = get().projects.find((p) => p.id === projectId);
        simulateChat(get, set, projectId, project?.name ?? 'project', msg);
      },
      setTyping: (projectId, members) => set((s) => ({ typing: { ...s.typing, [projectId]: members } })),

      // ---- reactions ----
      toggleReaction: (projectId, messageId, emoji) =>
        set((s) => {
          const list = s.reactions[messageId] ?? [];
          const me = get().currentUserId;
          const next = list.some((r) => r.emoji === emoji && r.userId === me)
            ? list.filter((r) => !(r.emoji === emoji && r.userId === me))
            : [...list, { emoji, userId: me }];
          return { reactions: { ...s.reactions, [messageId]: next } };
        }),

      // ---- invites ----
      acceptInvite: (inviteId) => {
        const invite = get().invites.find((i) => i.id === inviteId);
        if (!invite) return;
        const me = get().currentUserId;
        let projects = get().projects;
        let workspaces = get().workspaces;
        let msg = '';
        if (invite.type === 'project') {
          projects = projects.map((p) =>
            p.id === invite.projectId && !p.memberIds.includes(me)
              ? { ...p, memberIds: [...p.memberIds, me], roles: { ...p.roles, [me]: invite.role ?? 'Member' } }
              : p
          );
          msg = `You joined ${projects.find((p) => p.id === invite.projectId)?.name ?? 'the project'} — welcome aboard.`;
        } else {
          workspaces = workspaces.map((w) =>
            w.id === invite.workspaceId && !w.memberIds.includes(me)
              ? { ...w, memberIds: [...w.memberIds, me], roles: { ...w.roles, [me]: invite.role ?? 'Member' } }
              : w
          );
          msg = `You joined the ${workspaces.find((w) => w.id === invite.workspaceId)?.name ?? 'workspace'} — welcome aboard.`;
        }
        set((s) => ({
          invites: s.invites.filter((i) => i.id !== inviteId),
          projects,
          workspaces,
          activeWorkspaceId: invite.workspaceId,
          activeProjectId: invite.type === 'project' ? invite.projectId : null,
        }));
        get().toast('success', msg);
      },
      declineInvite: (inviteId) => {
        set((s) => ({ invites: s.invites.filter((i) => i.id !== inviteId) }));
        get().toast('info', 'Invite declined.');
      },

      // ---- notifications ----
      addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications].slice(0, 60) })),
      markNotificationRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      removeNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
      clearAllNotifications: () => set((s) => ({ notifications: [] })),

      // ---- members ----
      addWorkspaceMember: (workspaceId, userId, role = 'Member') => {
        const ws = get().workspaces.find((w) => w.id === workspaceId);
        if (!ws) return false;
        if (ws.memberIds.includes(userId)) {
          get().toast('info', 'User is already a workspace member');
          return false;
        }
        set((s) => ({
          workspaces: s.workspaces.map((w) =>
            w.id === workspaceId
              ? { ...w, memberIds: [...w.memberIds, userId], roles: { ...w.roles, [userId]: role } }
              : w
          ),
        }));
        get().toast('success', 'Member added to workspace');
        return true;
      },

      removeWorkspaceMember: (workspaceId, userId) => {
        set((s) => ({
          workspaces: s.workspaces.map((w) =>
            w.id === workspaceId
              ? {
                  ...w,
                  memberIds: w.memberIds.filter((m) => m !== userId),
                  roles: { ...w.roles, [userId]: undefined },
                }
              : w
          ),
          projects: s.projects.map((p) =>
            p.workspaceId === workspaceId && p.memberIds.includes(userId)
              ? { ...p, memberIds: p.memberIds.filter((m) => m !== userId), roles: { ...p.roles, [userId]: undefined } }
              : p
          ),
        }));
        get().toast('info', 'Member removed from workspace and its projects');
      },

      leaveWorkspace: (workspaceId) => {
        const me = get().currentUserId;
        const ws = get().workspaces.find((w) => w.id === workspaceId);
        if (!ws || !me) return;
        const wasOwner = ws.roles[me] === 'Owner';
        const workspaces = get()
          .workspaces.map((w) => {
            if (w.id !== workspaceId) return w;
            const memberIds = w.memberIds.filter((m) => m !== me);
            const roles = { ...w.roles, [me]: undefined };
            // If the owner leaves, promote the first remaining member so the
            // workspace never ends up ownerless.
            if (wasOwner && memberIds.length && !Object.values(roles).includes('Owner')) {
              roles[memberIds[0]] = 'Owner';
            }
            return { ...w, memberIds, roles };
          })
          // A workspace with nobody left is empty — remove it entirely.
          .filter((w) => w.id !== workspaceId || w.memberIds.length > 0);
        const projects = get().projects.map((p) =>
          p.workspaceId === workspaceId && p.memberIds.includes(me)
            ? {
                ...p,
                memberIds: p.memberIds.filter((m) => m !== me),
                roles: { ...p.roles, [me]: undefined },
              }
            : p
        );
        set({ workspaces, projects });
        get().toast('info', `You left ${ws.name}`);
        if (get().activeWorkspaceId === workspaceId) {
          const remaining = workspaces.filter((w) => w.memberIds.includes(me));
          if (remaining.length) get().setActiveWorkspace(remaining[0].id);
          else set({ activeWorkspaceId: null, activeProjectId: null });
        } else {
          const active = get().projects.find((p) => p.id === get().activeProjectId);
          if (active?.workspaceId === workspaceId) set({ activeProjectId: null });
        }
      },

      setWorkspaceRole: (workspaceId, userId, role) =>
        set((s) => ({
          workspaces: s.workspaces.map((w) =>
            w.id === workspaceId ? { ...w, roles: { ...w.roles, [userId]: role } } : w
          ),
        })),

      addProjectMember: (projectId, userId) => {
        const project = get().projects.find((p) => p.id === projectId);
        const ws = get().workspaces.find((w) => w.id === project?.workspaceId);
        if (!project || !ws) return false;
        if (!ws.memberIds.includes(userId)) {
          get().toast('error', 'Failed to add member — user must be invited to the workspace first');
          return false;
        }
        if (project.memberIds.includes(userId)) {
          get().toast('info', 'User is already a project member');
          return false;
        }
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, memberIds: [...p.memberIds, userId], roles: { ...p.roles, [userId]: 'Member' } }
              : p
          ),
        }));
        get().toast('success', 'Member added to project');
        return true;
      },

      removeProjectMember: (projectId, userId) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, memberIds: p.memberIds.filter((m) => m !== userId), roles: { ...p.roles, [userId]: undefined } }
              : p
          ),
        }));
        get().toast('info', 'Member removed from project');
      },

      setProjectRole: (projectId, userId, role) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, roles: { ...p.roles, [userId]: role } } : p
          ),
        })),
    }),
    {
      name: 'devflow-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        theme: s.theme,
        signedIn: s.signedIn,
        currentUserId: s.currentUserId,
        activeWorkspaceId: s.activeWorkspaceId,
        activeProjectId: s.activeProjectId,
        // Invite decisions persist so pending invite cards only appear once
        // per invite instead of re-seeding on every refresh.
        invites: s.invites,
      }),
    }
  )
);

// Ambient activity: occasionally the assignee of an active project's issue links a
// commit so the board and notifications feel alive. Wired once per page session.
if (typeof window !== 'undefined') {
  let seeded = false;
  const ambientTimer = () => {
    setTimeout(() => {
      const s = useAppStore.getState();
      if (s.signedIn && s.activeProjectId) {
        const pool = s.issues.filter(
          (i) =>
            i.projectId === s.activeProjectId &&
            i.status !== 'done' &&
            i.assigneeId &&
            i.assigneeId !== s.currentUserId
        );
        if (pool.length) {
          maybeSimulateCommit(
            () => useAppStore.getState(),
            useAppStore.setState,
            pool[Math.floor(Math.random() * pool.length)].id
          );
        }
      }
      ambientTimer();
    }, 28000 + Math.random() * 22000);
  };
  useAppStore.subscribe((s) => {
    if (!seeded && s.signedIn) {
      seeded = true;
      ambientTimer();
    }
  });
}
