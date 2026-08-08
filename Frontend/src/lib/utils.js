import { formatDistanceToNow, format } from 'date-fns';

export const cx = (...args) => args.filter(Boolean).join(' ');

export const uid = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

export const hashStr = (s = '') => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const shortSha = (sha = '') => sha.slice(0, 7);

export const randomSha = () =>
  Array.from({ length: 40 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');

export const timeAgo = (iso) => formatDistanceToNow(new Date(iso), { addSuffix: true });

export const fmt = (iso, pattern = 'MMM d, yyyy') => format(new Date(iso), pattern);

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
