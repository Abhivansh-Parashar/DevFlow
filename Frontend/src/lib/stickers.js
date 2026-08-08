// DevFlow sticker pack — emoji "stickers" rendered on vibrant gradient tiles.
// Used by the chat sticker picker, seeded chat messages and simulated replies.

export const STICKERS = [
  // ---- Dev ----
  { id: 'ship', emoji: '🚀', label: 'Ship it', bg: 'linear-gradient(135deg, #0d9488, #2563eb)' },
  { id: 'approve', emoji: '✅', label: 'Approved', bg: 'linear-gradient(135deg, #059669, #0d9488)' },
  { id: 'review', emoji: '🔍', label: 'Review this', bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)' },
  { id: 'commit', emoji: '🔗', label: 'Linked', bg: 'linear-gradient(135deg, #2563eb, #4338ca)' },
  { id: 'merge', emoji: '🔀', label: 'Merge me', bg: 'linear-gradient(135deg, #d97706, #b45309)' },
  { id: 'bug', emoji: '🐛', label: 'Bug spotted', bg: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
  { id: 'fire', emoji: '🔥', label: 'On fire', bg: 'linear-gradient(135deg, #ea580c, #dc2626)' },
  { id: 'coffee', emoji: '☕', label: 'Coffee break', bg: 'linear-gradient(135deg, #92400e, #78350f)' },
  // ---- Reactions ----
  { id: 'thumbsup', emoji: '👍', label: 'Nice', bg: 'linear-gradient(135deg, #059669, #047857)' },
  { id: 'heart', emoji: '❤️', label: 'Love it', bg: 'linear-gradient(135deg, #ec4899, #db2777)' },
  { id: 'laugh', emoji: '😂', label: 'LOL', bg: 'linear-gradient(135deg, #d97706, #ea580c)' },
  { id: 'wow', emoji: '😮', label: 'Wow', bg: 'linear-gradient(135deg, #7c3aed, #9333ea)' },
  { id: 'party', emoji: '🎉', label: 'Party', bg: 'linear-gradient(135deg, #7c3aed, #db2777)' },
  { id: 'rocket', emoji: '🛸', label: 'UFO merge', bg: 'linear-gradient(135deg, #0891b2, #2563eb)' },
  // ---- Celebrate ----
  { id: 'tada', emoji: '🎊', label: 'Celebrate', bg: 'linear-gradient(135deg, #d97706, #ec4899)' },
  { id: 'confetti', emoji: '✨', label: 'Shipped', bg: 'linear-gradient(135deg, #0d9488, #7c3aed)' },
  { id: 'trophy', emoji: '🏆', label: 'Win', bg: 'linear-gradient(135deg, #d97706, #92400e)' },
  { id: 'star', emoji: '⭐', label: 'Star', bg: 'linear-gradient(135deg, #eab308, #d97706)' },
  { id: 'mindblown', emoji: '🤯', label: 'Mind blown', bg: 'linear-gradient(135deg, #9333ea, #6d28d9)' },
  { id: 'ghost', emoji: '👻', label: 'Boo', bg: 'linear-gradient(135deg, #475569, #334155)' },
  { id: 'dog', emoji: '🐶', label: 'Good dog', bg: 'linear-gradient(135deg, #b45309, #92400e)' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicorn', bg: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
];

export const STICKER_MAP = Object.fromEntries(STICKERS.map((s) => [s.id, s]));

export const STICKER_CATEGORIES = [
  { id: 'dev', label: 'Dev', stickerIds: ['ship', 'approve', 'review', 'commit', 'merge', 'bug', 'fire', 'coffee'] },
  { id: 'reactions', label: 'Reactions', stickerIds: ['thumbsup', 'heart', 'laugh', 'wow', 'party', 'rocket', 'star', 'mindblown'] },
  { id: 'celebrate', label: 'Celebrate', stickerIds: ['tada', 'confetti', 'trophy', 'ghost', 'dog', 'unicorn'] },
];

// Quick one-tap emoji reactions on a message (like WhatsApp / Slack).
export const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '🚀', '👀'];

// Sticker ids the simulated teammates occasionally send.
export const BOT_STICKER_IDS = ['ship', 'party', 'approve', 'fire', 'heart', 'tada', 'coffee', 'rocket'];
