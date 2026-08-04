import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { X, Check, Mail, Users } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Avatar, AvatarStack, Badge } from '../ui';
import { timeAgo } from '../../lib/utils';

/**
 * InviteStack — the "first screen after login" experience when there are
 * pending project/workspace invites. A square card sits in the center of the
 * screen, Tinder-style: accept flies it off to the right with a green glow,
 * decline swoops it anticlockwise off to the left with a reddish shadow.
 */
export function InviteStack() {
  const invites = useAppStore((s) => s.invites);
  const users = useAppStore((s) => s.users);
  const projects = useAppStore((s) => s.projects);
  const workspaces = useAppStore((s) => s.workspaces);
  const acceptInvite = useAppStore((s) => s.acceptInvite);
  const declineInvite = useAppStore((s) => s.declineInvite);
  // id → 'accept' | 'decline' — drives the fly-out animation.
  const [fly, setFly] = useState({});

  // Keyboard: ← decline, → accept (Tinder-style arrows).
  useEffect(() => {
    if (!invites.length) return;
    const onKey = (e) => {
      const top = invites[0];
      if (!top || fly[top.id]) return;
      if (e.key === 'ArrowLeft') setFly((f) => ({ ...f, [top.id]: 'decline' }));
      if (e.key === 'ArrowRight') setFly((f) => ({ ...f, [top.id]: 'accept' }));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [invites, fly]);

  if (!invites.length) return null;

  const finish = (id) => {
    const dir = fly[id];
    if (dir === 'accept') acceptInvite(id);
    else if (dir === 'decline') declineInvite(id);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/55 backdrop-blur-[6px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      {/* Ambient glow behind the stack */}
      <div
        className="pointer-events-none absolute h-[34rem] w-[34rem] rounded-full"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--signal-teal) 16%, transparent), transparent 68%)',
          filter: 'blur(10px)',
        }}
      />

      <div className="relative z-10 flex w-full flex-col items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-5 text-center"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal">
            {invites.length} invite{invites.length === 1 ? '' : 's'} waiting
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-white">You’ve been invited</h2>
        </motion.div>

        {/* Stack */}
        <div className="relative flex h-[min(430px,58vh)] w-[min(400px,86vw)] items-center justify-center">
          {invites.map((inv, i) => {
            const dir = fly[inv.id];
            return (
              <InviteCard
                key={inv.id}
                invite={inv}
                index={i}
                users={users}
                projects={projects}
                workspaces={workspaces}
                dir={dir}
                top={i === 0}
                onAccept={() => setFly((f) => ({ ...f, [inv.id]: 'accept' }))}
                onDecline={() => setFly((f) => ({ ...f, [inv.id]: 'decline' }))}
                onDone={() => finish(inv.id)}
              />
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50"
        >
          <span>← decline</span>
          <span className="text-white/25">·</span>
          <span>accept →</span>
        </motion.p>
      </div>
    </div>
  );
}

function InviteCard({ invite, index, users, projects, workspaces, dir, top, onAccept, onDecline, onDone }) {
  const from = users.find((u) => u.id === invite.fromUserId);
  const isProject = invite.type === 'project';
  const project = isProject ? projects.find((p) => p.id === invite.projectId) : null;
  const workspace = workspaces.find((w) => w.id === invite.workspaceId);
  const memberIds = isProject ? project?.memberIds ?? [] : workspace?.memberIds ?? [];
  const members = users.filter((u) => memberIds.includes(u.id));

  // Drag mechanics: x drives the swipe tilt + a directional glow. Only the top
  // card owns these motion values, so fly-out targets (x/y/boxShadow) animate
  // the same writable `x` value and never conflict with the derived rotate.
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-700, 0, 700], [-28, 0, 28]);
  const like = useTransform(x, [70, 260], [0, 1]);
  const nope = useTransform(x, [-260, -70], [1, 0]);

  // rotate lives on the wrapper (no style.rotate conflict), so button-triggered
  // flights also get the Tinder-style tilt on top of the arc.
  const flyAccept = { x: 560, y: -70, rotate: 20, scale: 0.92, opacity: 0, boxShadow: '0 26px 70px rgba(74, 222, 128, 0.55), 0 0 46px rgba(74, 222, 128, 0.35)' };
  const flyDecline = { x: -560, y: -150, rotate: -24, scale: 0.92, opacity: 0, boxShadow: '0 26px 70px rgba(248, 113, 113, 0.55), 0 0 46px rgba(248, 113, 113, 0.4)' };

  // Animate targets. rotate is deliberately left out of `animate` for the top
  // card (it is a derived motion value controlled by the drag's `x`).
  let target;
  if (dir) target = dir === 'accept' ? flyAccept : flyDecline;
  else if (top) target = { x: 0, y: 0, scale: 1, opacity: 1 };
  else
    target = {
      x: 0,
      y: index * 16,
      rotate: (index % 2 === 0 ? -1 : 1) * index * 1.4,
      scale: 1 - index * 0.055,
      opacity: 1,
    };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: 100 - index }}
      initial={{ opacity: 0, scale: 0.92, y: 40 }}
      animate={target}
      transition={{
        duration: dir ? 0.7 : 0.4,
        ease: dir ? [0.3, 0.72, 0.2, 1] : [0.16, 1, 0.3, 1],
        x: dir ? { duration: 0.7, ease: [0.55, 0.06, 0.68, 0.19] } : undefined,
        y: dir ? { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] } : undefined,
        boxShadow: dir ? { duration: 0.62 } : undefined,
        opacity: dir ? { duration: 0.55 } : undefined,
      }}
      onAnimationComplete={dir ? onDone : undefined}
    >
      <div className="relative h-full w-full">
        {/* Directional glow, follows the drag / fly-out (top card only) */}
        {top && (
          <>
            <motion.div
              className="pointer-events-none absolute -inset-3 rounded-[2rem]"
              style={{
                opacity: like,
                background: 'radial-gradient(62% 62% at 50% 50%, rgba(74,222,128,0.4), transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            <motion.div
              className="pointer-events-none absolute -inset-3 rounded-[2rem]"
              style={{
                opacity: nope,
                background: 'radial-gradient(62% 62% at 50% 50%, rgba(248,113,113,0.42), transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
          </>
        )}

        {/* The square card */}
        <motion.div
          drag={top && !dir ? 'x' : false}
          dragElastic={0.75}
          dragMomentum={false}
          style={top ? { x, rotate, boxShadow: '0 24px 64px -12px rgba(0,0,0,0.5)' } : undefined}
          onDragEnd={(_, info) => {
            if (dir) return;
            if (info.offset.x > 110 || info.velocity.x > 700) onAccept();
            else if (info.offset.x < -110 || info.velocity.x < -700) onDecline();
          }}
          whileDrag={{ scale: 1.035 }}
          className="card-surface relative flex aspect-square w-full flex-col overflow-hidden rounded-[1.75rem] shadow-pop"
        >
          {/* Top accent strip */}
          <div
            className="h-1.5 w-full shrink-0"
            style={{ background: `linear-gradient(90deg, ${workspace?.accent ?? 'var(--signal-teal)'}, ${project?.color ?? 'var(--signal-violet)'})` }}
          />
          <div className="flex min-h-0 flex-1 flex-col p-6 sm:p-7">
            {/* Header row: workspace + role */}
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 rounded-full border border-line bg-raised px-2.5 py-1">
                <span
                  className="grid shrink-0 place-items-center rounded text-[9px] font-bold text-white"
                  style={{ background: workspace?.accent, height: 18, width: 18 }}
                >
                  {workspace?.icon ?? '◆'}
                </span>
                <span className="truncate text-[11px] font-semibold text-ink">{workspace?.name}</span>
              </span>
              <Badge variant={isProject ? 'violet' : 'azure'} size="sm">
                {isProject ? `${invite.role} · project` : `${invite.role} · workspace`}
              </Badge>
            </div>

            {/* Project identity */}
            <div className="mt-5 flex items-start gap-4">
              <span
                className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-xl font-bold text-white"
                style={{ background: project?.color ?? workspace?.accent }}
              >
                {project?.icon ?? workspace?.icon}
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-teal">invited to</p>
                <h3 className="mt-0.5 truncate font-display text-xl font-bold text-ink">
                  {project?.name ?? workspace?.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-muted">
                  {project?.description ?? 'A brand new workspace, ready for your boards.'}
                </p>
              </div>
            </div>

            {/* Inviter */}
            <div className="mt-5 flex items-center gap-3">
              <Avatar user={from} size={36} showStatus />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink">{from?.name}</p>
                <p className="text-[11.5px] text-muted">
                  {isProject ? 'asked you to join this project' : 'invited you to this workspace'} · {timeAgo(invite.createdAt)}
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="mt-4 rounded-xl border border-line bg-raised px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                <Mail size={11} /> invitation
              </div>
              <p className="mt-1.5 text-[13px] italic leading-relaxed text-ink">“{invite.message}”</p>
            </div>

            <div className="flex-1" />

            {/* Member preview */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <Users size={13} className="text-muted" />
                <AvatarStack members={members} limit={4} size={22} showStatus />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {members.length} member{members.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* NOPE / LIKE stamps while dragging */}
          {top && !dir && (
            <>
              <motion.div
                style={{ opacity: nope }}
                className="pointer-events-none absolute left-5 top-5 -rotate-12 rounded-lg border-2 border-coral px-2.5 py-1 font-display text-lg font-extrabold uppercase tracking-widest text-coral"
              >
                Nope
              </motion.div>
              <motion.div
                style={{ opacity: like }}
                className="pointer-events-none absolute right-5 top-5 rotate-12 rounded-lg border-2 border-teal px-2.5 py-1 font-display text-lg font-extrabold uppercase tracking-widest text-teal"
              >
                Like
              </motion.div>
            </>
          )}

          {/* Action buttons — bottom left / bottom right corners */}
          <div className="pointer-events-none absolute inset-x-0 bottom-5 flex items-center justify-between px-6">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={onDecline}
              disabled={!!dir}
              aria-label="Decline invite"
              title="Decline (←)"
              className="focus-ring pointer-events-auto grid place-items-center rounded-full border border-coral-soft bg-card text-coral shadow-[0_8px_24px_rgba(220,38,38,0.25)] transition-transform hover:scale-105 disabled:opacity-40"
              style={{ height: 52, width: 52 }}
            >
              <X size={22} strokeWidth={2.4} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={onAccept}
              disabled={!!dir}
              aria-label="Accept invite"
              title="Accept (→)"
              className="focus-ring pointer-events-auto grid place-items-center rounded-full bg-teal text-white shadow-[0_8px_24px_rgba(13,148,136,0.4)] transition-transform hover:scale-105 disabled:opacity-40"
              style={{ height: 56, width: 56 }}
            >
              <Check size={24} strokeWidth={2.6} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
