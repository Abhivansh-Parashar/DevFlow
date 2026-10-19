import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { Toaster, CustomCursor } from './components/ui';
import { AppShell } from './components/layout/AppShell';

import { Board } from './components/kanban/Board';
import { IssueDetailPage } from './components/issue/IssueDetailPage';
import { ChatPage } from './pages/ChatPage';
import { MembersPage } from './pages/MembersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AIPage } from './pages/AIPage';
import { SettingsPage } from './pages/SettingsPage';
import { AccountPage } from './pages/AccountPage';
import { AuthPage } from './pages/AuthPage';
import { Landing } from './pages/Landing';
import { NotFoundPage } from './pages/NotFoundPage';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';
import { tokenStore } from './lib/api/client';
import { userService, workspaceService, inviteService } from './lib/api/services';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RequireAuth({ children }) {
  const signedIn = useAppStore((s) => s.signedIn);
  const userId = useAppStore((s) => s.currentUserId);
  if (!signedIn || !userId) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const signedIn = useAppStore((s) => s.signedIn);
  const currentUserId = useAppStore((s) => s.currentUserId);

  useEffect(() => {
    if (!signedIn || !currentUserId) return;
    if (!tokenStore.access) {
      useAppStore.getState().signOut();
      return;
    }

    userService.me()
      .then((user) => useAppStore.setState((state) => ({
        users: state.users.some((item) => String(item.id) === String(user.id))
          ? state.users.map((item) => String(item.id) === String(user.id) ? { ...item, ...user, id: String(user.id) } : item)
          : [...state.users, { ...user, id: String(user.id) }],
        currentUserId: String(user.id),
      })))
      .then(async () => {
        const [workspaceRows, inviteRows] = await Promise.all([
          workspaceService.list(),
          inviteService.list(),
        ]);
        const workspaces = (Array.isArray(workspaceRows) ? workspaceRows : []).map((workspace) => ({
          ...workspace,
          id: String(workspace.id),
          memberIds: (workspace.memberIds || []).map(String),
          roles: Object.fromEntries(Object.entries(workspace.roles || {}).map(([id, role]) => [String(id), String(role).replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())])),
        }));
        const members = await Promise.all(workspaces.map((workspace) => workspaceService.members(workspace.id)));
        const users = members.flat().map((member) => ({
          id: String(member.userId),
          name: member.name,
          email: member.email,
          avatar: member.avatar,
          online: member.online,
        }));
        useAppStore.setState((state) => ({
          workspaces,
          invites: (Array.isArray(inviteRows) ? inviteRows : []).map((invite) => ({
            ...invite,
            id: String(invite.id),
            workspaceId: String(invite.workspaceId),
          })),
          users: [...state.users.filter((user) => !users.some((item) => item.id === user.id)), ...users],
          activeWorkspaceId: workspaces.some((workspace) => workspace.id === state.activeWorkspaceId)
            ? state.activeWorkspaceId
            : workspaces[0]?.id ?? null,
        }));
      })
      .catch(() => {
        tokenStore.clear();
        useAppStore.getState().signOut();
      });
  }, [signedIn, currentUserId]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="board" element={<Board />} />
          <Route path="issue/:issueId" element={<IssueDetailPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
      <CustomCursor />
    </BrowserRouter>
  );
}
