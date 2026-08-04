import { cx, initials, hashStr } from '../../lib/utils';
import { AVATAR_COLORS } from '../../lib/constants';

const hueFor = (name) => AVATAR_COLORS[hashStr(name) % AVATAR_COLORS.length];

export function Avatar({ user, name, src, size = 28, showStatus = false, ring = false, className }) {
  const label = name ?? user?.name ?? '?';
  const color = user?.color ?? hueFor(label);
  const dims = { width: size, height: size };
  return (
    <span
      className={cx('relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white', ring && 'ring-2 ring-card', className)}
      style={{ ...dims, background: color, fontSize: Math.round(size * 0.38) }}
      title={label}
    >
      {src ? (
        <img src={src} alt={label} className="h-full w-full rounded-full object-cover" />
      ) : (
        initials(label)
      )}
      {showStatus && (
        <span
          className={cx(
            'absolute -bottom-0.5 -right-0.5 block rounded-full border-2 border-card',
            user?.online ? 'bg-teal' : 'bg-muted'
          )}
          style={{ width: Math.max(8, size * 0.32), height: Math.max(8, size * 0.32) }}
        />
      )}
    </span>
  );
}

export function AvatarStack({ members = [], limit = 4, size = 24, showStatus = false }) {
  const visible = members.slice(0, limit);
  const extra = members.length - visible.length;
  return (
    <span className="flex items-center">
      {visible.map((m, idx) => (
        <span key={m.id} className="-ml-1.5 first:ml-0" style={{ zIndex: visible.length - idx }}>
          <Avatar user={m} size={size} ring showStatus={showStatus} />
        </span>
      ))}
      {extra > 0 && (
        <span
          className="-ml-1.5 inline-flex items-center justify-center rounded-full bg-raised text-[11px] font-semibold text-muted ring-2 ring-card"
          style={{ width: size, height: size }}
        >
          +{extra}
        </span>
      )}
    </span>
  );
}
