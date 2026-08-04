import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, MessageSquare, Hash, Sticker, SmilePlus, X, AtSign } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Avatar, AvatarStack, EmptyState, RichText, CodeBlock, splitCode } from '../components/ui';
import { timeAgo, cx } from '../lib/utils';
import { STICKER_MAP, STICKER_CATEGORIES, QUICK_REACTIONS } from '../lib/stickers';

/* ------------------------------ Sticker bubble ------------------------------ */
function StickerBubble({ msg }) {
  const st = STICKER_MAP[msg.sticker];
  if (!st) return null;
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      className="relative grid h-20 w-20 place-items-center rounded-2xl text-[42px] shadow-soft"
      style={{ background: st.bg }}
    >
      {st.emoji}
      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-card px-1.5 py-0.5 text-[9px] font-semibold text-muted shadow-sm">
        {st.label}
      </span>
    </motion.div>
  );
}

/* ------------------------------ Message row ------------------------------ */
function Message({ msg, users, isMine, projectId, reactions, toggleReaction, currentUserId, pickerFor, setPickerFor, pickerRef }) {
  const author = users.find((u) => u.id === msg.authorId);
  const parts = splitCode(msg.body);
  const isSticker = !!msg.sticker;

  const list = reactions[msg.id] ?? [];
  const groups = {};
  list.forEach((r) => {
    groups[r.emoji] = (groups[r.emoji] ?? 0) + 1;
  });
  const groupEntries = Object.entries(groups);
  const mySet = new Set(list.filter((r) => r.userId === currentUserId).map((r) => r.emoji));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
      className={cx('group relative flex items-start gap-2.5', isMine && 'flex-row-reverse')}
    >
      <Avatar user={author} size={30} showStatus />
      <div className={cx('max-w-[78%]', isMine && 'text-right')}>
        <div className={cx('mb-1 flex items-baseline gap-2', isMine && 'flex-row-reverse')}>
          <span className="text-[13px] font-semibold text-ink">{isMine ? 'You' : author?.name}</span>
          <span className="font-mono text-[11px] text-muted">{timeAgo(msg.createdAt)}</span>
        </div>

        {isSticker ? (
          <div className="inline-block pl-1 pr-1 pt-1">
            <StickerBubble msg={msg} />
          </div>
        ) : (
          <div
            className={cx(
              'rounded-2xl border px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink',
              isMine
                ? 'bubble-mine rounded-tr-sm border-teal bg-teal text-white dark:text-[#04120E]'
                : 'rounded-tl-sm border-line bg-card'
            )}
          >
            {parts.map((p, i) =>
              p.type === 'code' ? <CodeBlock key={i} code={p.value} lang={p.lang} /> : <RichText key={i} text={p.value} />
            )}
          </div>
        )}

        {/* Reactions */}
        <div className={cx('mt-1.5 flex flex-wrap items-center gap-1', isMine && 'flex-row-reverse')}>
          {groupEntries.map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => toggleReaction(projectId, msg.id, emoji)}
              className={cx(
                'focus-ring flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11.5px] font-semibold transition-colors',
                mySet.has(emoji)
                  ? 'border-teal-soft bg-teal text-white dark:text-[#04120E]'
                  : 'border-line bg-card text-muted hover:border-teal-soft hover:text-ink'
              )}
            >
              <span className="text-[13px] leading-none">{emoji}</span>
              <span>{count}</span>
            </button>
          ))}
          <button
            onClick={() => setPickerFor(pickerFor === msg.id ? null : msg.id)}
            aria-label="Add reaction"
            title="React"
            className="focus-ring grid h-6 w-6 place-items-center rounded-full border border-line bg-card text-muted opacity-0 transition-all hover:border-teal-soft hover:text-teal group-hover:opacity-100"
          >
            <SmilePlus size={12} />
          </button>
        </div>

        {/* Reaction quick picker */}
        {pickerFor === msg.id && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
            className={cx('glass-popover absolute z-20 mt-1 flex items-center gap-0.5 rounded-full p-1', isMine ? 'right-10' : 'left-10')}
          >
            {QUICK_REACTIONS.map((e) => (
              <button
                key={e}
                onClick={() => {
                  toggleReaction(projectId, msg.id, e);
                  setPickerFor(null);
                }}
                className="focus-ring grid h-7 w-7 place-items-center rounded-full text-[15px] transition-transform hover:scale-125"
              >
                {e}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------ Sticker picker ------------------------------ */
function StickerPicker({ onPick, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="glass-popover absolute bottom-full left-0 z-30 mb-2 w-[332px] max-w-[calc(100vw-2.5rem)] rounded-2xl p-3"
    >
      <div className="flex items-center justify-between">
        <p className="mono-label">DevFlow stickers</p>
        <button
          onClick={onClose}
          aria-label="Close stickers"
          className="focus-ring grid h-6 w-6 place-items-center rounded-md text-muted hover:bg-raised hover:text-ink"
        >
          <X size={13} />
        </button>
      </div>
      <div className="mt-2 max-h-60 space-y-3 overflow-y-auto pr-1">
        {STICKER_CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{cat.label}</p>
            <div className="mt-1.5 grid grid-cols-4 gap-1.5">
              {cat.stickerIds.map((id) => {
                const st = STICKER_MAP[id];
                return (
                  <button
                    key={id}
                    onClick={() => onPick(id)}
                    title={st.label}
                    className="sticker-tile grid h-13 w-full place-items-center rounded-xl text-[25px]"
                    style={{ background: st.bg, height: 52 }}
                  >
                    {st.emoji}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------ Page ------------------------------ */
export function ChatPage() {
  const activeProject = useAppStore((s) => s.activeProject());
  const users = useAppStore((s) => s.users);
  const chat = useAppStore((s) => s.chat);
  const typing = useAppStore((s) => s.typing);
  const reactions = useAppStore((s) => s.reactions);
  const sendChat = useAppStore((s) => s.sendChat);
  const toggleReaction = useAppStore((s) => s.toggleReaction);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const [draft, setDraft] = useState('');
  const [stickerOpen, setStickerOpen] = useState(false);
  const [pickerFor, setPickerFor] = useState(null);
  const [mentionIdx, setMentionIdx] = useState(0);
  const [mentionDismissed, setMentionDismissed] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pickerRef = useRef(null);

  const messages = activeProject ? (chat[activeProject.id] ?? []) : [];
  const typers = activeProject
    ? (typing[activeProject.id] ?? []).map((id) => users.find((u) => u.id === id)).filter(Boolean)
    : [];

  // --- @mention matching (computed unconditionally so hook order stays stable) ---
  const mentionMatch = draft.match(/(?:^|\s)@([\w.-]*)$/);
  const mentionQuery = mentionMatch ? mentionMatch[1] : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typers.length]);

  useEffect(() => {
    setMentionDismissed(false);
    setMentionIdx(0);
  }, [mentionQuery]);

  // Close the reaction picker when clicking anywhere outside of it.
  useEffect(() => {
    if (!pickerFor) return;
    const onDown = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerFor(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [pickerFor]);

  if (!activeProject) {
    return <div className="mx-auto max-w-xl px-4 py-20"><EmptyState tile icon={MessageSquare} title="Select a project" description="Chat is scoped to the active project." /></div>;
  }

  const members = users.filter((u) => activeProject.memberIds.includes(u.id));

  const candidates =
    mentionQuery != null && !mentionDismissed
      ? members
          .filter(
            (m) =>
              m.id !== currentUserId &&
              (m.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
                m.email.toLowerCase().includes(mentionQuery.toLowerCase()))
          )
          .slice(0, 6)
      : [];
  const mentionOpen = candidates.length > 0;
  const safeMentionIdx = Math.min(mentionIdx, Math.max(0, candidates.length - 1));

  const pickMention = (user) => {
    if (!user) return;
    const m = draft.match(/(?:^|\s)@([\w.-]*)$/);
    if (!m) return;
    const at = draft.lastIndexOf('@');
    const before = draft.slice(0, at);
    const after = draft.slice(at + 1 + m[1].length);
    setDraft(before + '@' + user.name + ' ' + after);
    setMentionDismissed(true);
    inputRef.current?.focus();
  };

  const submit = () => {
    if (!draft.trim()) return;
    sendChat(activeProject.id, draft);
    setDraft('');
    inputRef.current?.focus();
  };

  const sendSticker = (id) => {
    sendChat(activeProject.id, '', { sticker: id });
    setStickerOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg fill-teal-soft text-teal">
          <Hash size={16} />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-[15px] font-bold text-ink">#{activeProject.name.toLowerCase().replace(/\s+/g, '-')}</h1>
          <p className="truncate text-xs text-muted">
            Project-scoped channel · {members.length} member{members.length === 1 ? '' : 's'} can see this
          </p>
        </div>
        <div className="flex-1" />
        <span className="hidden items-center gap-1.5 rounded-full border border-line bg-raised px-2.5 py-1 text-[11px] font-medium text-muted sm:flex">
          <AtSign size={12} className="text-teal" /> @ to mention
        </span>
        <AvatarStack members={members} limit={6} size={26} showStatus />
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
          <EmptyState compact icon={MessageSquare} title="No messages yet" description="Say hi to the project — replies are simulated by your teammates." />
        )}
        {messages.map((m) => (
          <Message
            key={m.id}
            msg={m}
            users={users}
            isMine={m.authorId === currentUserId}
            projectId={activeProject.id}
            reactions={reactions}
            toggleReaction={toggleReaction}
            currentUserId={currentUserId}
            pickerFor={pickerFor}
            setPickerFor={setPickerFor}
            pickerRef={pickerRef}
          />
        ))}
        {typers.length > 0 && (
          <div className="flex items-center gap-2.5">
            <AvatarStack members={typers} limit={3} size={26} />
            <span className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-line bg-card px-3.5 py-2.5 text-xs text-muted">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-teal" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
              {typers.map((t) => t?.name?.split(' ')[0]).join(', ')} typing…
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-line px-5 py-3.5">
        <div className="relative">
          {/* Mention suggestions */}
          {mentionOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="glass-popover absolute bottom-full left-0 z-30 mb-2 w-full max-w-md rounded-xl p-1.5"
            >
              <p className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                mention someone — {candidates.length} match{candidates.length === 1 ? '' : 'es'}
              </p>
              {candidates.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => pickMention(m)}
                  onMouseEnter={() => setMentionIdx(i)}
                  className={cx(
                    'focus-ring flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                    i === safeMentionIdx ? 'fill-raised' : 'hover:bg-raised'
                  )}
                >
                  <Avatar user={m} size={26} showStatus />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink">{m.name}</span>
                    <span className="block truncate text-[11px] text-muted">{m.email}</span>
                  </span>
                  <AtSign size={13} className="shrink-0 text-teal" />
                </button>
              ))}
            </motion.div>
          )}

          {/* Sticker picker */}
          <AnimatePresence>
            {stickerOpen && <StickerPicker onPick={sendSticker} onClose={() => setStickerOpen(false)} />}
          </AnimatePresence>

          <div className="flex items-end gap-2.5">
            <button
              onClick={() => {
                setStickerOpen((v) => !v);
                setPickerFor(null);
              }}
              aria-label="Open stickers"
              title="Stickers"
              className={cx(
                'focus-ring grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border transition-colors',
                stickerOpen ? 'border-teal-soft fill-teal-soft text-teal' : 'border-line bg-raised text-muted hover:border-teal-soft hover:text-teal'
              )}
            >
              <Sticker size={17} />
            </button>
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (mentionOpen) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setMentionIdx((i) => (i + 1) % candidates.length);
                    return;
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setMentionIdx((i) => (i - 1 + candidates.length) % candidates.length);
                    return;
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    pickMention(candidates[safeMentionIdx] ?? candidates[0]);
                    return;
                  }
                  if (e.key === 'Escape') {
                    setMentionDismissed(true);
                    return;
                  }
                }
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={1}
              placeholder={`Message #${activeProject.name.toLowerCase().replace(/\s+/g, '-')}…  (Enter to send, Shift+Enter for newline)`}
              className="focus-ring ph-muted glass-input max-h-32 min-h-[42px] w-full resize-none rounded-xl px-4 py-2.5 text-sm text-ink"
            />
            <button
              onClick={submit}
              disabled={!draft.trim()}
              aria-label="Send message"
              className="focus-ring grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-teal text-white transition-all hover:brightness-110 disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
        <p className="mt-1.5 pl-1 font-mono text-[10px] text-muted">
          wrap code in ``` fences · type <span className="text-teal">@</span> to mention · react on hover
        </p>
      </div>
    </div>
  );
}
