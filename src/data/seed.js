// Seed data — a believable multi-tenant dataset so the demo feels alive.
// Timestamps are generated relative to "now" so relative labels always look right.

const now = Date.now();
export const minsAgo = (n) => new Date(now - n * 60_000).toISOString();
export const hoursAgo = (n) => new Date(now - n * 3_600_000).toISOString();
export const daysAgo = (n) => new Date(now - n * 86_400_000).toISOString();

const cmt = (id, authorId, body, at, replies = []) => ({ id, authorId, body, createdAt: at, replies });
const cm = (id, sha, message, branch, authorId, at) => ({ id, sha, message, branch, authorId, createdAt: at });
const hist = (...steps) => steps;

export const seedUsers = [
  { id: 'u1', name: 'Ada Lovelace', email: 'ada@acmelabs.dev', color: '#009E88', online: true },
  { id: 'u2', name: 'Linus Torvalds', email: 'linus@acmelabs.dev', color: '#7C6AE8', online: true },
  { id: 'u3', name: 'Grace Hopper', email: 'grace@acmelabs.dev', color: '#FFB454', online: true },
  { id: 'u4', name: 'Alan Turing', email: 'alan@acmelabs.dev', color: '#FF6B6B', online: true },
  { id: 'u5', name: 'Margaret Hamilton', email: 'margaret@acmelabs.dev', color: '#3B82F6', online: false },
  { id: 'u6', name: 'Dennis Ritchie', email: 'dennis@acmelabs.dev', color: '#10B981', online: true },
  { id: 'u7', name: 'Katherine Johnson', email: 'katherine@vertex.dev', color: '#EC4899', online: true },
  { id: 'u8', name: 'Edsger Dijkstra', email: 'edsger@vertex.dev', color: '#8B5CF6', online: false },
  { id: 'u9', name: 'Donald Knuth', email: 'donald@vertex.dev', color: '#F59E0B', online: true },
];

export const seedWorkspaces = [
  {
    id: 'ws1', name: 'Acme Labs', slug: 'acme-labs', icon: '▲', accent: '#009E88',
    memberIds: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
    roles: { u1: 'Owner', u2: 'Admin', u3: 'Admin', u4: 'Member', u5: 'Member', u6: 'Member' },
  },
  {
    id: 'ws2', name: 'Vertex Systems', slug: 'vertex', icon: '◈', accent: '#7C6AE8',
    memberIds: ['u1', 'u7', 'u8', 'u9'],
    roles: { u7: 'Owner', u8: 'Admin', u1: 'Member', u9: 'Member' },
  },
  {
    // The current user (u1) is NOT a member — it must never appear in the switcher.
    id: 'ws3', name: 'Pelican Studio', slug: 'pelican', icon: '▽', accent: '#FFB454',
    memberIds: ['u2', 'u3'],
    roles: { u2: 'Owner', u3: 'Admin' },
  },
];

export const seedProjects = [
  { id: 'p1', workspaceId: 'ws1', name: 'Frontend', description: 'Product UI, design system and the pipeline board.', color: '#009E88', icon: '#', keyPrefix: 'DEV', memberIds: ['u1', 'u2', 'u3', 'u4'], roles: { u1: 'Owner', u2: 'Member', u3: 'Member', u4: 'Member' } },
  { id: 'p2', workspaceId: 'ws1', name: 'Backend', description: 'APIs, auth and the realtime gateway.', color: '#7C6AE8', icon: '#', keyPrefix: 'API', memberIds: ['u1', 'u2', 'u5', 'u6'], roles: { u1: 'Owner', u2: 'Member', u5: 'Member', u6: 'Member' } },
  { id: 'p3', workspaceId: 'ws1', name: 'DevOps', description: 'CI/CD, observability and release tooling.', color: '#FFB454', icon: '#', keyPrefix: 'OPS', memberIds: ['u1', 'u3', 'u6'], roles: { u1: 'Owner', u3: 'Member', u6: 'Member' } },
  { id: 'p4', workspaceId: 'ws2', name: 'Mobile', description: 'iOS & Android client with offline-first sync.', color: '#FF6B6B', icon: '#', keyPrefix: 'MOB', memberIds: ['u1', 'u7', 'u8'], roles: { u7: 'Owner', u8: 'Member', u1: 'Member' } },
  { id: 'p5', workspaceId: 'ws2', name: 'Data Platform', description: 'Lakehouse catalog, pipelines and query layer.', color: '#3B82F6', icon: '#', keyPrefix: 'DTA', memberIds: ['u7', 'u8', 'u9'], roles: { u7: 'Owner', u8: 'Member', u9: 'Member' } },
  // Brand new project — Ada is invited but not yet a member.
  { id: 'p6', workspaceId: 'ws1', name: 'Design System', description: 'Token architecture, component library and living docs.', color: '#EC4899', icon: '#', keyPrefix: 'DSN', memberIds: ['u3'], roles: { u3: 'Owner' } },
];

const mkIssue = ({ id, projectId, key, title, description, status, priority, labels, assigneeId, reporterId, createdAt, comments = [], commits = [], statusHistory = [], aiGenerated = false }) => ({
  id, projectId, key, title, description, status, priority, labels, assigneeId, reporterId,
  createdAt, updatedAt: createdAt, comments, commits, statusHistory, aiGenerated,
});

export const seedIssues = [
  // ---- Acme Labs / Frontend (DEV) ----
  mkIssue({
    id: 'i1', projectId: 'p1', key: 'DEV-099', title: 'Initial setup',
    description: 'Scaffold the Vite app, wire Tailwind design tokens, and stand up the first app-shell route.',
    status: 'done', priority: 'high', labels: ['infra', 'refactor'], assigneeId: 'u2', reporterId: 'u1', createdAt: daysAgo(26),
    comments: [
      cmt('c1', 'u2', 'Repo is live — pushed the Vite scaffold with the token layer.', daysAgo(26), [
        cmt('c1r1', 'u1', 'Nice. The pipeline line component lands next.', daysAgo(25)),
      ]),
      cmt('c2', 'u1', 'App shell approved in review. Closing this out.', daysAgo(24)),
    ],
    commits: [
      cm('cm1', 'a3f9c2d4e5b6471a9c0e8d2f4a6b8c0d2e4f6a8b0', 'chore: scaffold vite + tailwind tokens', 'main', 'u2', daysAgo(26)),
      cm('cm2', 'b1e2d3c4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0', 'feat: app shell with frosted sidebar', 'main', 'u2', daysAgo(25)),
    ],
    statusHistory: hist(
      { from: null, to: 'backlog', by: 'u2', at: daysAgo(26) },
      { from: 'backlog', to: 'todo', by: 'u2', at: daysAgo(26) },
      { from: 'todo', to: 'in_progress', by: 'u2', at: daysAgo(25) },
      { from: 'in_progress', to: 'review', by: 'u2', at: daysAgo(24) },
      { from: 'review', to: 'done', by: 'u1', at: daysAgo(24) },
    ),
  }),
  mkIssue({
    id: 'i2', projectId: 'p1', key: 'DEV-100', title: 'Design system tokens',
    description: 'Define light/dark CSS custom properties and the Tailwind theme mapping.',
    status: 'done', priority: 'medium', labels: ['design'], assigneeId: 'u3', reporterId: 'u1', createdAt: daysAgo(18),
    comments: [
      cmt('c3', 'u3', 'Tokens committed. AA-calibrated against both canvases.', daysAgo(18)),
    ],
    commits: [
      cm('cm3', 'c4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3', 'feat: light/dark design tokens', 'theme/tokens', 'u3', daysAgo(18)),
    ],
    statusHistory: hist(
      { from: null, to: 'backlog', by: 'u3', at: daysAgo(18) },
      { from: 'backlog', to: 'done', by: 'u1', at: daysAgo(16) },
    ),
  }),
  mkIssue({
    id: 'i3', projectId: 'p1', key: 'DEV-101', title: 'Fix auth redirect loop on token refresh',
    description: 'Repro: refresh an expired token and the client loops /login → /app. Likely a stale refresh grant being retried.',
    status: 'backlog', priority: 'high', labels: ['bug'], assigneeId: 'u4', reporterId: 'u4', createdAt: daysAgo(2),
    comments: [
      cmt('c4', 'u4', 'Confirmed on main. The refresh interceptor doesn’t invalidate the previous grant.', daysAgo(2)),
    ],
    statusHistory: hist({ from: null, to: 'backlog', by: 'u4', at: daysAgo(2) }),
  }),
  mkIssue({
    id: 'i4', projectId: 'p1', key: 'DEV-102', title: 'Build UI',
    description: 'Build the core product UI — board, issue detail, and the pipeline line engine driving them.',
    status: 'in_progress', priority: 'high', labels: ['feature', 'design'], assigneeId: 'u1', reporterId: 'u1', createdAt: daysAgo(5),
    comments: [
      cmt('c5', 'u1', 'Starting with the GSAP spine — path tracing + node glow.', daysAgo(4), [
        cmt('c5r1', 'u3', 'Scrub feels better with 0.5 smoothing. Try it.', daysAgo(4)),
      ]),
      cmt('c6', 'u2', 'Board store slice is in. Moved this to In Progress.', hoursAgo(5)),
    ],
    commits: [
      cm('cm4', 'd6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5', 'feat: pipeline spine with ScrollTrigger scrub', 'feat/pipeline-line', 'u1', daysAgo(3)),
      cm('cm5', 'e7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6', 'feat: node glow + reduced-motion fallback', 'feat/pipeline-line', 'u1', daysAgo(1)),
    ],
    statusHistory: hist(
      { from: null, to: 'backlog', by: 'u1', at: daysAgo(5) },
      { from: 'backlog', to: 'todo', by: 'u1', at: daysAgo(5) },
      { from: 'todo', to: 'in_progress', by: 'u2', at: hoursAgo(5) },
    ),
  }),
  mkIssue({
    id: 'i5', projectId: 'p1', key: 'DEV-103', title: 'Finalize dark theme tokens',
    description: 'Land the dark palette: graphite surfaces, luminous accents, glass top highlight.',
    status: 'review', priority: 'medium', labels: ['design'], assigneeId: 'u3', reporterId: 'u1', createdAt: daysAgo(4),
    comments: [
      cmt('c7', 'u3', '@ada can you sanity-check the amber contrast on raised?', daysAgo(2)),
      cmt('c8', 'u1', 'Amber hits AA on raised. Approved pending the hover state.', daysAgo(1)),
    ],
    commits: [
      cm('cm6', 'f8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7', 'feat: dark theme tokens final pass', 'theme/tokens', 'u3', daysAgo(2)),
    ],
    statusHistory: hist(
      { from: null, to: 'backlog', by: 'u3', at: daysAgo(4) },
      { from: 'backlog', to: 'todo', by: 'u3', at: daysAgo(3) },
      { from: 'todo', to: 'review', by: 'u3', at: daysAgo(1) },
    ),
  }),
  mkIssue({
    id: 'i6', projectId: 'p1', key: 'DEV-104', title: 'Add team chat',
    description: 'Project-scoped realtime group chat with code snippet formatting and typing indicators.',
    status: 'todo', priority: 'medium', labels: ['feature'], assigneeId: 'u2', reporterId: 'u1', createdAt: daysAgo(2),
    comments: [
      cmt('c9', 'u2', 'Socket layer sketch is in #backend — I’ll share the API shape today.', daysAgo(1)),
    ],
    statusHistory: hist(
      { from: null, to: 'backlog', by: 'u1', at: daysAgo(2) },
      { from: 'backlog', to: 'todo', by: 'u1', at: daysAgo(1) },
    ),
  }),
  mkIssue({
    id: 'i7', projectId: 'p1', key: 'DEV-105', title: 'Unify focus rings across themes',
    description: 'Every interactive control shows a 2px signal-teal ring on keyboard navigation.',
    status: 'backlog', priority: 'low', labels: ['bug', 'design'], assigneeId: 'u4', reporterId: 'u3', createdAt: daysAgo(1),
    statusHistory: hist({ from: null, to: 'backlog', by: 'u3', at: daysAgo(1) }),
  }),
  mkIssue({
    id: 'i8', projectId: 'p1', key: 'DEV-106', title: 'Migrate icon set to lucide-react',
    description: 'Drop the hand-rolled SVG set in favor of lucide for consistency.',
    status: 'todo', priority: 'low', labels: ['refactor'], assigneeId: 'u3', reporterId: 'u1', createdAt: daysAgo(1),
    statusHistory: hist({ from: null, to: 'backlog', by: 'u1', at: daysAgo(1) }, { from: 'backlog', to: 'todo', by: 'u1', at: hoursAgo(20) }),
  }),
  mkIssue({
    id: 'i9', projectId: 'p1', key: 'DEV-107', title: 'Memoize board columns to cut re-renders',
    description: 'The board re-derives column arrays on every keystroke in the filter bar.',
    status: 'in_progress', priority: 'medium', labels: ['perf'], assigneeId: 'u2', reporterId: 'u1', createdAt: daysAgo(2),
    commits: [
      cm('cm7', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'perf: memo column derivations', 'perf/board', 'u2', hoursAgo(6)),
    ],
    statusHistory: hist(
      { from: null, to: 'backlog', by: 'u1', at: daysAgo(2) },
      { from: 'backlog', to: 'in_progress', by: 'u2', at: hoursAgo(6) },
    ),
  }),
  mkIssue({
    id: 'i10', projectId: 'p1', key: 'DEV-108', title: 'Draft pipeline timeline spec',
    description: 'Spec the activity timeline: status transitions, commit links, comment threads on one trace.',
    status: 'review', priority: 'low', labels: ['design', 'ai'], assigneeId: 'u1', reporterId: 'u3', createdAt: daysAgo(1),
    statusHistory: hist(
      { from: null, to: 'backlog', by: 'u3', at: daysAgo(1) },
      { from: 'backlog', to: 'review', by: 'u1', at: hoursAgo(4) },
    ),
  }),

  // ---- Acme Labs / Frontend (DEV) — extended board ----
  mkIssue({
    id: 'i19', projectId: 'p1', key: 'DEV-109', title: 'Add realtime typing indicators',
    description: 'Show who is typing in the project channel with animated dots, capped at three avatars, with presence from the mock socket layer.',
    status: 'in_progress', priority: 'medium', labels: ['feature'], assigneeId: 'u2', reporterId: 'u1', createdAt: hoursAgo(6),
    comments: [
      cmt('c12', 'u2', 'Socket events are wired — throttling rapid keystrokes to one ping per 800ms.', hoursAgo(3)),
    ],
    commits: [
      cm('cm10', 'd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f', 'feat: typing indicator throttle + presence', 'feat/typing', 'u2', hoursAgo(2)),
    ],
    statusHistory: hist(
      { from: null, to: 'backlog', by: 'u1', at: hoursAgo(6) },
      { from: 'backlog', to: 'in_progress', by: 'u2', at: hoursAgo(2) },
    ),
  }),
  mkIssue({
    id: 'i20', projectId: 'p1', key: 'DEV-110', title: 'Sticker picker accessibility pass',
    description: 'Keyboard-operable sticker grid, focus management on open, and aria-labels for every tile.',
    status: 'todo', priority: 'low', labels: ['design', 'feature'], assigneeId: 'u3', reporterId: 'u1', createdAt: hoursAgo(5),
    statusHistory: hist(
      { from: null, to: 'backlog', by: 'u1', at: hoursAgo(5) },
      { from: 'backlog', to: 'todo', by: 'u3', at: hoursAgo(2) },
    ),
  }),
  mkIssue({
    id: 'i21', projectId: 'p1', key: 'DEV-111', title: 'Dark-mode chart contrast',
    description: 'Grid lines and axis labels drop below WCAG contrast in dark mode on the analytics page — recalibrate the palette.',
    status: 'backlog', priority: 'medium', labels: ['design', 'bug'], assigneeId: 'u4', reporterId: 'u3', createdAt: hoursAgo(8),
    statusHistory: hist({ from: null, to: 'backlog', by: 'u3', at: hoursAgo(8) }),
  }),
  mkIssue({
    id: 'i22', projectId: 'p1', key: 'DEV-112', title: 'Board column virtualization',
    description: 'Projects with hundreds of cards jank on drag — virtualize column lists above 60 items.',
    status: 'backlog', priority: 'high', labels: ['perf'], assigneeId: 'u2', reporterId: 'u1', createdAt: hoursAgo(4),
    comments: [
      cmt('c13', 'u2', 'Quick spike: react-window with dnd-kit sortable adapters works; the drop ghost needs padding.', hoursAgo(2)),
    ],
    statusHistory: hist({ from: null, to: 'backlog', by: 'u1', at: hoursAgo(4) }),
  }),
  mkIssue({
    id: 'i23', projectId: 'p1', key: 'DEV-113', title: 'Invite flow empty states',
    description: 'When an invite card has no member preview, show a friendly placeholder instead of a bare avatar row.',
    status: 'review', priority: 'medium', labels: ['feature', 'design'], assigneeId: 'u1', reporterId: 'u4', createdAt: hoursAgo(7),
    comments: [
      cmt('c14', 'u1', 'Empty state handled — flagging back for a second look at the button hover states.', hoursAgo(1)),
    ],
    statusHistory: hist(
      { from: null, to: 'backlog', by: 'u4', at: hoursAgo(7) },
      { from: 'backlog', to: 'review', by: 'u1', at: hoursAgo(1) },
    ),
  }),
  mkIssue({
    id: 'i24', projectId: 'p1', key: 'DEV-114', title: 'Migrate router to v7 data patterns',
    description: 'Adopt loaders and actions so route transitions can fetch scoped data without extra state wiring.',
    status: 'todo', priority: 'low', labels: ['refactor'], assigneeId: 'u3', reporterId: 'u1', createdAt: hoursAgo(3),
    statusHistory: hist({ from: null, to: 'backlog', by: 'u1', at: hoursAgo(3) }, { from: 'backlog', to: 'todo', by: 'u3', at: hoursAgo(1) }),
  }),
  mkIssue({
    id: 'i25', projectId: 'p1', key: 'DEV-115', title: 'Keyboard navigation for mentions',
    description: 'Arrow-up/down through the mention list, Enter to complete, Escape to dismiss — matching the group-chat feel.',
    status: 'in_progress', priority: 'medium', labels: ['feature', 'ai'], assigneeId: 'u1', reporterId: 'u1', createdAt: hoursAgo(5),
    comments: [
      cmt('c15', 'u1', 'Suggestion list wired to the textarea caret; remaining: scroll-into-view on arrow keys.', hoursAgo(2)),
    ],
    statusHistory: hist(
      { from: null, to: 'backlog', by: 'u1', at: hoursAgo(5) },
      { from: 'backlog', to: 'in_progress', by: 'u1', at: hoursAgo(2) },
    ),
  }),
  mkIssue({
    id: 'i26', projectId: 'p1', key: 'DEV-116', title: 'Pipeline line mobile fallback',
    description: 'The horizontal board trace overflows on small screens — degrade to a static status stepper under 640px.',
    status: 'review', priority: 'high', labels: ['design', 'perf'], assigneeId: 'u2', reporterId: 'u3', createdAt: hoursAgo(10),
    commits: [
      cm('cm11', 'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a', 'feat: static stepper fallback for small screens', 'feat/pipeline-mobile', 'u2', hoursAgo(4)),
    ],
    statusHistory: hist(
      { from: null, to: 'backlog', by: 'u3', at: hoursAgo(10) },
      { from: 'backlog', to: 'review', by: 'u2', at: hoursAgo(4) },
    ),
  }),

  // ---- Acme Labs / Backend (API) ----
  mkIssue({
    id: 'i11', projectId: 'p2', key: 'API-201', title: 'Rate limiting middleware',
    description: 'Token-bucket limiter per API key with Redis counters.',
    status: 'done', priority: 'high', labels: ['infra', 'perf'], assigneeId: 'u5', reporterId: 'u2', createdAt: daysAgo(12),
    commits: [cm('cm8', 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c', 'feat: token-bucket rate limiter', 'main', 'u5', daysAgo(10))],
    statusHistory: hist({ from: null, to: 'backlog', by: 'u2', at: daysAgo(12) }, { from: 'backlog', to: 'done', by: 'u5', at: daysAgo(10) }),
  }),
  mkIssue({
    id: 'i12', projectId: 'p2', key: 'API-202', title: 'Webhook signature validation',
    description: 'HMAC-SHA256 signatures on outbound webhooks; verify inbound from Stripe + GitHub.',
    status: 'in_progress', priority: 'high', labels: ['bug', 'infra'], assigneeId: 'u6', reporterId: 'u2', createdAt: daysAgo(3),
    comments: [cmt('c10', 'u6', 'Shared the signing util — pending the public key endpoint.', hoursAgo(8))],
    statusHistory: hist({ from: null, to: 'backlog', by: 'u2', at: daysAgo(3) }, { from: 'backlog', to: 'in_progress', by: 'u6', at: hoursAgo(8) }),
  }),
  mkIssue({
    id: 'i13', projectId: 'p2', key: 'API-203', title: 'Postgres connection pooling',
    description: 'Move from per-request connections to a bounded pool with health checks.',
    status: 'todo', priority: 'medium', labels: ['infra', 'perf'], assigneeId: 'u5', reporterId: 'u2', createdAt: daysAgo(1),
    statusHistory: hist({ from: null, to: 'backlog', by: 'u2', at: daysAgo(1) }, { from: 'backlog', to: 'todo', by: 'u2', at: hoursAgo(12) }),
  }),

  // ---- Acme Labs / Backend (API) — extended ----
  mkIssue({
    id: 'i27', projectId: 'p2', key: 'API-204', title: 'Idempotent webhook retries',
    description: 'Deliveries retried with the same Idempotency-Key must not double-fire side effects downstream.',
    status: 'todo', priority: 'high', labels: ['infra', 'perf'], assigneeId: 'u5', reporterId: 'u2', createdAt: hoursAgo(5),
    statusHistory: hist(
      { from: null, to: 'backlog', by: 'u2', at: hoursAgo(5) },
      { from: 'backlog', to: 'todo', by: 'u5', at: hoursAgo(2) },
    ),
  }),
  mkIssue({
    id: 'i28', projectId: 'p2', key: 'API-205', title: 'Rate limit headers',
    description: 'Expose X-RateLimit-Limit/Remaining/Reset on every API response and document the semantics.',
    status: 'backlog', priority: 'low', labels: ['infra'], assigneeId: 'u6', reporterId: 'u2', createdAt: hoursAgo(3),
    statusHistory: hist({ from: null, to: 'backlog', by: 'u2', at: hoursAgo(3) }),
  }),

  // ---- Acme Labs / DevOps (OPS) ----
  mkIssue({
    id: 'i14', projectId: 'p3', key: 'OPS-301', title: 'Migrate CI to GitHub Actions',
    description: 'Replace Jenkins with Actions workflows, caching node_modules per branch.',
    status: 'done', priority: 'medium', labels: ['infra'], assigneeId: 'u6', reporterId: 'u3', createdAt: daysAgo(9),
    commits: [cm('cm9', 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', 'ci: actions workflows + cache', 'main', 'u6', daysAgo(8))],
    statusHistory: hist({ from: null, to: 'backlog', by: 'u3', at: daysAgo(9) }, { from: 'backlog', to: 'done', by: 'u6', at: daysAgo(8) }),
  }),
  mkIssue({
    id: 'i15', projectId: 'p3', key: 'OPS-302', title: 'Prometheus alerting rules',
    description: 'Alert on p95 latency and error-rate SLO breaches, routed to the incident channel.',
    status: 'todo', priority: 'low', labels: ['infra'], assigneeId: 'u6', reporterId: 'u3', createdAt: daysAgo(2),
    statusHistory: hist({ from: null, to: 'backlog', by: 'u3', at: daysAgo(2) }, { from: 'backlog', to: 'todo', by: 'u3', at: daysAgo(1) }),
  }),

  // ---- Acme Labs / DevOps (OPS) — extended ----
  mkIssue({
    id: 'i29', projectId: 'p3', key: 'OPS-303', title: 'Chat latency dashboard',
    description: 'Grafana board for message publish-to-deliver p95, sliced by workspace, with an alert above 300ms.',
    status: 'backlog', priority: 'medium', labels: ['infra'], assigneeId: 'u6', reporterId: 'u3', createdAt: hoursAgo(4),
    statusHistory: hist({ from: null, to: 'backlog', by: 'u3', at: hoursAgo(4) }),
  }),

  // ---- Vertex / Mobile (MOB) ----
  mkIssue({
    id: 'i16', projectId: 'p4', key: 'MOB-401', title: 'Offline-first sync engine',
    description: 'Local queue + conflict resolution based on last-writer-wins per field.',
    status: 'in_progress', priority: 'high', labels: ['feature', 'perf'], assigneeId: 'u7', reporterId: 'u7', createdAt: daysAgo(4),
    comments: [cmt('c11', 'u7', 'Sync spec v3 up — CRDT-lite for lists, LWW for scalars.', daysAgo(2))],
    statusHistory: hist({ from: null, to: 'backlog', by: 'u7', at: daysAgo(4) }, { from: 'backlog', to: 'in_progress', by: 'u7', at: daysAgo(3) }),
  }),
  mkIssue({
    id: 'i17', projectId: 'p4', key: 'MOB-402', title: 'Push notification payloads',
    description: 'Deep-link payloads so taps open the right issue thread.',
    status: 'todo', priority: 'medium', labels: ['feature'], assigneeId: 'u8', reporterId: 'u7', createdAt: daysAgo(1),
    statusHistory: hist({ from: null, to: 'backlog', by: 'u7', at: daysAgo(1) }, { from: 'backlog', to: 'todo', by: 'u7', at: hoursAgo(6) }),
  }),

  // ---- Vertex / Data Platform (DTA) ----
  mkIssue({
    id: 'i18', projectId: 'p5', key: 'DTA-501', title: 'Lakehouse table cataloging',
    description: 'Auto-register new tables into the catalog with column-level profiling.',
    status: 'backlog', priority: 'medium', labels: ['feature', 'infra'], assigneeId: 'u8', reporterId: 'u9', createdAt: daysAgo(1),
    statusHistory: hist({ from: null, to: 'backlog', by: 'u9', at: daysAgo(1) }),
  }),

  // ---- Acme Labs / Design System (DSN) — the invite target project ----
  mkIssue({
    id: 'i30', projectId: 'p6', key: 'DSN-601', title: 'Mention chip theming tokens',
    description: 'Expose chip colors as design tokens so dark/light both meet AA, and document usage in the components page.',
    status: 'todo', priority: 'medium', labels: ['design', 'feature'], assigneeId: 'u3', reporterId: 'u3', createdAt: hoursAgo(20),
    statusHistory: hist(
      { from: null, to: 'backlog', by: 'u3', at: hoursAgo(20) },
      { from: 'backlog', to: 'todo', by: 'u3', at: hoursAgo(6) },
    ),
  }),
  mkIssue({
    id: 'i31', projectId: 'p6', key: 'DSN-602', title: 'Component API documentation',
    description: 'Every component gets a props table, an example, and a playground embed in the docs site.',
    status: 'backlog', priority: 'low', labels: ['design', 'docs'], assigneeId: 'u3', reporterId: 'u3', createdAt: hoursAgo(16),
    statusHistory: hist({ from: null, to: 'backlog', by: 'u3', at: hoursAgo(16) }),
  }),
  mkIssue({
    id: 'i32', projectId: 'p6', key: 'DSN-603', title: 'A11y checklist runner',
    description: 'Automate the axe-core scan on every published story and gate the CI build on critical violations.',
    status: 'in_progress', priority: 'high', labels: ['infra', 'design'], assigneeId: 'u3', reporterId: 'u3', createdAt: hoursAgo(9),
    commits: [
      cm('cm12', 'f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b', 'ci: axe scan + violation gate', 'ci/a11y', 'u3', hoursAgo(3)),
    ],
    statusHistory: hist(
      { from: null, to: 'backlog', by: 'u3', at: hoursAgo(9) },
      { from: 'backlog', to: 'in_progress', by: 'u3', at: hoursAgo(3) },
    ),
  }),
];

seedIssues.forEach((i) => {
  const project = seedProjects.find((p) => p.id === i.projectId);
  i.workspaceId = project.workspaceId;
});

export const seedChat = {
  p1: [
    { id: 'm1', projectId: 'p1', authorId: 'u2', body: 'Pushed the board store slice — moved DEV-102 to In Progress.', createdAt: hoursAgo(5) },
    { id: 'm2', projectId: 'p1', authorId: 'u3', body: 'Dark tokens are ready for review. Sample:', code: '--surface-card: #1B1E24;\n--signal-teal: #00C2A8;', createdAt: hoursAgo(4) },
    { id: 'm3', projectId: 'p1', authorId: 'u1', body: 'Reviewing now. Let’s ship the theme toggle with it.', createdAt: hoursAgo(3) },
    { id: 'm4', projectId: 'p1', authorId: 'u4', body: 'Heads up: the auth redirect loop repros on token refresh. Logged as DEV-101.', createdAt: hoursAgo(2) },
    { id: 'm5', projectId: 'p1', authorId: 'u2', body: '@Ada can you sanity-check the dark tokens once you’re free?', createdAt: minsAgo(46) },
    { id: 'm6', projectId: 'p1', authorId: 'u3', body: '', sticker: 'party', createdAt: minsAgo(40) },
    { id: 'm7', projectId: 'p1', authorId: 'u1', body: 'On it — tokens look great. Shipping the toggle with them tonight 🚀', createdAt: minsAgo(32) },
  ],
  p2: [
    { id: 'm8', projectId: 'p2', authorId: 'u5', body: 'Rate limiter shipped to prod. Watchdog running.', createdAt: daysAgo(1) },
    { id: 'm9', projectId: 'p2', authorId: 'u6', body: '@Ada the webhook util is ready for review in API-202.', createdAt: hoursAgo(9) },
  ],
};

// Seeded emoji reactions (messageId → [{ emoji, userId }]).
export const seedReactions = {
  m4: [
    { emoji: '👍', userId: 'u1' },
    { emoji: '🚀', userId: 'u2' },
  ],
  m3: [{ emoji: '❤️', userId: 'u2' }],
  m2: [{ emoji: '🔥', userId: 'u1' }],
};

// Pending invites waiting for Ada (u1) on first load.
export const seedInvites = [
  {
    id: 'inv1',
    type: 'project',
    workspaceId: 'ws2',
    projectId: 'p5',
    fromUserId: 'u7',
    role: 'Member',
    message: 'We are scaling the lakehouse catalog and need your pipeline instinct. The Data Platform crew would love to have you.',
    createdAt: hoursAgo(3),
  },
  {
    id: 'inv2',
    type: 'project',
    workspaceId: 'ws1',
    projectId: 'p6',
    fromUserId: 'u3',
    role: 'Owner',
    message: 'Starting a Design System track in Acme Labs — tokens, components, docs. Want to own it with me?',
    createdAt: hoursAgo(6),
  },
  {
    id: 'inv3',
    type: 'workspace',
    workspaceId: 'ws3',
    fromUserId: 'u2',
    role: 'Member',
    message: 'Linus and I are spinning up Pelican Studio for client work. It needs your eye for clean boards.',
    createdAt: daysAgo(1),
  },
];

export const seedNotifications = [
  { id: 'n1', type: 'commit', title: 'Linus pushed 2 commits to DEV-099', body: 'feat: app shell · chore: scaffold tokens', issueId: 'i1', projectId: 'p1', read: false, createdAt: minsAgo(20) },
  { id: 'n2', type: 'mention', title: 'Grace mentioned you in DEV-103', body: '“@ada can you sanity-check the amber contrast?”', issueId: 'i5', projectId: 'p1', read: false, createdAt: hoursAgo(1) },
  { id: 'n3', type: 'status', title: 'DEV-102 moved to In Progress', body: 'Linus changed status from Todo → In Progress', issueId: 'i4', projectId: 'p1', read: true, createdAt: hoursAgo(3) },
  { id: 'n4', type: 'invite', title: 'Katherine invited you to Data Platform', body: '“We are scaling the lakehouse catalog…”', read: false, createdAt: hoursAgo(3) },
  { id: 'n5', type: 'chat', title: 'Linus mentioned you in #frontend', body: '“@Ada can you sanity-check the dark tokens once you’re free?”', read: false, createdAt: minsAgo(46) },
];
