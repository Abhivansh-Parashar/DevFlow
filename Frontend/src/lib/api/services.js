import { apiClient } from './client';

export const authService = {
	login: (body) => apiClient.post('/api/auth/login', body),
	register: (body) => apiClient.post('/api/auth/register', body),
	exchangeOAuth: (code) => apiClient.post('/api/auth/oauth/exchange', { code }),
	logout: (refreshToken) => apiClient.post('/api/auth/logout', { token: refreshToken }),
};

export const userService = {
	me: () => apiClient.get('/api/users/me'),
	update: (body) => apiClient.put('/api/users/me', body),
	avatar: (file) => {
		const data = new FormData();
		data.append('file', file);
		return apiClient.upload('/api/users/me/avatar', data);
	},
};

export const projectService = {
	list: (workspaceId) => apiClient.get(`/api/workspaces/${workspaceId}/projects`),
	get: (projectId) => apiClient.get(`/api/projects/${projectId}`),
	create: (workspaceId, body) => apiClient.post(`/api/workspaces/${workspaceId}/projects`, body),
	update: (projectId, body) => apiClient.put(`/api/projects/${projectId}`, body),
	remove: (projectId) => apiClient.delete(`/api/projects/${projectId}`),
};

export const memberService = {
	add: (projectId, body) => apiClient.post(`/api/projects/${projectId}/members`, body),
	remove: (projectId, userId) => apiClient.delete(`/api/projects/${projectId}/members/${userId}`),
	role: (projectId, userId, role) => apiClient.put(`/api/projects/${projectId}/members/${userId}/role`, role),
};

export const chatService = {
	list: (projectId, page = 0, size = 50) => apiClient.get(`/api/projects/${projectId}/chat?page=${page}&size=${size}`),
	send: (projectId, body) => apiClient.post(`/api/projects/${projectId}/chat`, body),
};

export const dashboardService = {
	get: (workspaceId) => apiClient.get(`/api/workspaces/${workspaceId}/dashboard`),
};

export const analyticsService = {
	get: (workspaceId) => apiClient.get(`/api/workspaces/${workspaceId}/analytics`),
};

export const workspaceService = {
	list: () => apiClient.get('/api/workspaces'),
	create: (body) => apiClient.post('/api/workspaces', body),
	members: (workspaceId) => apiClient.get(`/api/workspaces/${workspaceId}/members`),
	invite: (workspaceId, email) => apiClient.post(`/api/workspaces/${workspaceId}/invites`, { email }),
};

export const inviteService = {
	list: () => apiClient.get('/api/invites'),
	accept: (inviteId) => apiClient.post(`/api/invites/${inviteId}/accept`, {}),
	decline: (inviteId) => apiClient.post(`/api/invites/${inviteId}/decline`, {}),
};

export const aiService = {
	ask: (projectId, question) => apiClient.post(`/api/projects/${projectId}/ai/ask`, { question }),
};
