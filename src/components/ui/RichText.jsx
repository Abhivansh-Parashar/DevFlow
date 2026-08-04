import { cx } from '../../lib/utils';

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const inline = (text) =>
  escapeHtml(text)
    // WhatsApp-style @mention chips. Runs before backtick-code replacement so
    // later <code> markup is never re-processed; note that @names inside
    // backtick code will still be styled as chips (a rare edge case).
    .replace(/(^|\s)@([\w.-]+)/g, '$1<span class="mention-chip">@$2</span>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-raised px-1 py-0.5 font-mono text-[0.9em] text-teal">$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-teal underline underline-offset-2">$1</a>');

function Block({ children, className }) {
  return <div className={cx('text-sm leading-relaxed text-ink', className)}>{children}</div>;
}

export function RichText({ text = '', className }) {
  if (!text.trim()) {
    return <p className={cx('text-sm italic text-muted', className)}>No description yet — add one to give context.</p>;
  }

  const lines = text.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    if (line.trimStart().startsWith('```')) {
      const lang = line.trimStart().slice(3).trim();
      const buf = [];
      i += 1;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        buf.push(lines[i]);
        i += 1;
      }
      i += 1; // closing fence
      blocks.push(
        <div key={`code-${blocks.length}`} className="my-3 overflow-hidden rounded-lg border border-line">
          <div className="flex items-center justify-between border-b border-line bg-raised px-3 py-1.5">
            <span className="mono-label">{lang || 'code'}</span>
            <span className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: 'var(--signal-coral)', opacity: 0.6 }} />
              <span className="h-2 w-2 rounded-full" style={{ background: 'var(--signal-amber)', opacity: 0.6 }} />
              <span className="h-2 w-2 rounded-full" style={{ background: 'var(--signal-teal)', opacity: 0.6 }} />
            </span>
          </div>
          <pre className="overflow-x-auto bg-canvas px-4 py-3 font-mono text-[12.5px] leading-relaxed text-ink">
            {buf.join('\n')}
          </pre>
        </div>
      );
      continue;
    }

    // heading
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const Tag = level === 1 ? 'h3' : level === 2 ? 'h4' : 'h5';
      blocks.push(
        <Tag key={`h-${blocks.length}`} className="mt-4 mb-1 font-display font-semibold text-ink first:mt-0">
          <span dangerouslySetInnerHTML={{ __html: inline(h[2]) }} />
        </Tag>
      );
      i += 1;
      continue;
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-2 list-disc space-y-1 pl-5 marker:text-teal">
          {items.map((it, k) => (
            <li key={k} dangerouslySetInnerHTML={{ __html: inline(it) }} />
          ))}
        </ul>
      );
      continue;
    }

    // ordered list
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ol key={`ol-${blocks.length}`} className="my-2 list-decimal space-y-1 pl-5 marker:text-teal">
          {items.map((it, k) => (
            <li key={k} dangerouslySetInnerHTML={{ __html: inline(it) }} />
          ))}
        </ol>
      );
      continue;
    }

    // blockquote
    if (/^\s*>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''));
        i += 1;
      }
      blocks.push(
        <blockquote
          key={`q-${blocks.length}`}
          className="my-2 border-l-2 pl-3 text-muted"
          style={{ borderLeftColor: 'color-mix(in srgb, var(--signal-teal) 55%, transparent)' }}
        >
          {buf.map((b, k) => (
            <p key={k} dangerouslySetInnerHTML={{ __html: inline(b) }} />
          ))}
        </blockquote>
      );
      continue;
    }

    // empty line
    if (!line.trim()) {
      i += 1;
      continue;
    }

    // paragraph (merge following plain lines)
    const buf = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !lines[i].trimStart().startsWith('```')
    ) {
      buf.push(lines[i]);
      i += 1;
    }
    blocks.push(
      <Block key={`p-${blocks.length}`}>
        <p className="my-2 first:mt-0 last:mb-0" dangerouslySetInnerHTML={{ __html: inline(buf.join(' ')) }} />
      </Block>
    );
  }

  return <div className={cx('space-y-1', className)}>{blocks}</div>;
}

// Chat code-block splitter: message → [{text}|{code}]
export function splitCode(text = '') {
  const parts = [];
  const re = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ type: 'text', value: text.slice(last, m.index) });
    parts.push({ type: 'code', lang: m[1], value: m[2] });
    last = re.lastIndex;
  }
  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) });
  return parts.length ? parts : [{ type: 'text', value: text }];
}

export function CodeBlock({ code, lang }) {
  return (
    <div className="my-2 overflow-hidden rounded-lg border border-line">
      <div className="flex items-center justify-between border-b border-line bg-raised px-3 py-1.5">
        <span className="mono-label">{lang || 'code'}</span>
        <span className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: 'var(--signal-coral)', opacity: 0.6 }} />
          <span className="h-2 w-2 rounded-full" style={{ background: 'var(--signal-amber)', opacity: 0.6 }} />
          <span className="h-2 w-2 rounded-full" style={{ background: 'var(--signal-teal)', opacity: 0.6 }} />
        </span>
      </div>
      <pre className="overflow-x-auto bg-canvas px-4 py-3 font-mono text-[12.5px] leading-relaxed text-ink">
        {code}
      </pre>
    </div>
  );
}
