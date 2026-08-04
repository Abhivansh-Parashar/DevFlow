// Simulated realtime layer.
// There is no socket server in this demo, so a mock peer answers chat messages,
// shows typing indicators, occasionally links a commit, and drops notifications.
// All functions are pure of the store — they receive `get`/`set` to stay acyclic.

import { uid, randomSha } from './utils';
import { BOT_STICKER_IDS } from './stickers';

const REPLIES = [
  'Ship it — I’ll watch the board.',
  'Agreed. Can you link the commit to the issue?',
  'Nice, that unblocks the review queue.',
  'On it. Folding this into my current branch.',
  'Makes sense. Flagging it to the workspace channel too.',
  'Good catch — adding a regression test before we merge.',
];

// Ways teammates ping the current user, WhatsApp-group style.
const MENTION_OPENERS = [
  'can you take a look when you get a sec?',
  'can you sanity-check the diff?',
  'thoughts before I merge?',
  'could you unblock the board?',
  'review when you’re free?',
  'can you own the follow-up?',
];

const COMMENT_REPLIES = [
  'Good call — updating the description now.',
  'Agreed, let’s track that in the same issue.',
  'I’ll take a look after standup.',
  'Can you share the repro steps?',
];

const CODE_SNIPPETS = [
  'git commit -m "feat: pipeline spine"\n# -> a3f9c2d … linked to DEV-102',
  'const board = useAppStore(s => s.issues)\n// memoized per column ✓',
  '--signal-teal: #00C2A8;\n/* dark mode, luminous */',
  'await client.issues.move({ key, to: "review" })',
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const userOf = (get, id) => get().users.find((u) => u.id === id);

export function simulateChat(get, set, projectId, projectName, msg) {
  const pool = get().users.filter((u) => u.id !== get().currentUserId && u.online);
  if (!pool.length) return;
  const responder = pick(pool);
  const typingDelay = 900 + Math.random() * 1100;
  const replyDelay = typingDelay + 1500 + Math.random() * 1800;

  setTimeout(() => {
    set((s) => ({
      typing: {
        ...s.typing,
        [projectId]: [...new Set([...(s.typing[projectId] ?? []), responder.id])],
      },
    }));
  }, typingDelay);

  setTimeout(() => {
    const me = get().currentUser();
    const useSticker = Math.random() < 0.18;
    const mention = !useSticker && Math.random() < 0.3;
    const firstName = me ? me.name.split(' ')[0] : 'Ada';
    const body = useSticker ? '' : mention ? `@${firstName} ${pick(MENTION_OPENERS)}` : pick(REPLIES);
    const reply = {
      id: uid('m'),
      projectId,
      authorId: responder.id,
      body,
      createdAt: new Date().toISOString(),
      sticker: useSticker ? pick(BOT_STICKER_IDS) : null,
      code: !useSticker && !mention && Math.random() < 0.3 ? pick(CODE_SNIPPETS) : null,
    };
    set((s) => ({
      typing: {
        ...s.typing,
        [projectId]: (s.typing[projectId] ?? []).filter((id) => id !== responder.id),
      },
      chat: { ...s.chat, [projectId]: [...(s.chat[projectId] ?? []), reply] },
      notifications:
        mention || Math.random() < 0.3
          ? [
              {
                id: uid('n'),
                type: mention ? 'mention' : 'chat',
                title: mention
                  ? `${responder.name.split(' ')[0]} mentioned you in ${projectName}`
                  : `${responder.name.split(' ')[0]} replied in ${projectName}`,
                body: (body || 'sent a sticker').slice(0, 110),
                read: false,
                createdAt: new Date().toISOString(),
              },
              ...s.notifications,
            ].slice(0, 60)
          : s.notifications,
    }));
    void msg;
  }, replyDelay);
}

export function maybeSimulateCommentReply(get, set, issueId) {
  const issue = get().issues.find((i) => i.id === issueId);
  if (!issue || !issue.assigneeId || issue.assigneeId === get().currentUserId) return;
  if (Math.random() > 0.55) return;
  const responder = userOf(get, issue.assigneeId);
  if (!responder) return;

  setTimeout(() => {
    const reply = {
      id: uid('c'),
      authorId: responder.id,
      body: pick(COMMENT_REPLIES),
      createdAt: new Date().toISOString(),
      replies: [],
    };
    set((s) => ({
      issues: s.issues.map((i) => (i.id === issueId ? { ...i, comments: [...i.comments, reply] } : i)),
    }));
  }, 2800 + Math.random() * 2600);
}

export function maybeSimulateCommit(get, set, issueId) {
  // Occasional ambient activity: the assignee links a commit to the issue.
  const issue = get().issues.find((i) => i.id === issueId);
  if (!issue) return;
  const author = issue.assigneeId ? userOf(get, issue.assigneeId) : null;
  if (!author || author.id === get().currentUserId) return;

  setTimeout(() => {
    const commit = {
      id: uid('cm'),
      sha: randomSha(),
      message: 'feat: incremental progress on ' + issue.key,
      branch: 'feat/' + issue.key.toLowerCase().replace('-', '-'),
      authorId: author.id,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      issues: s.issues.map((i) =>
        i.id === issueId ? { ...i, commits: [...i.commits, commit], updatedAt: new Date().toISOString() } : i
      ),
      notifications: [
        {
          id: uid('n'),
          type: 'commit',
          title: `${author.name.split(' ')[0]} pushed to ${issue.key}`,
          body: commit.message,
          issueId,
          projectId: issue.projectId,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...s.notifications,
      ].slice(0, 60),
    }));
  }, 5000 + Math.random() * 6000);
}
