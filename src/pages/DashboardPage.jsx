import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  Gauge, Activity, Users, Sparkles, Timer, CircleDot, CheckCircle2,
  TrendingUp, Clock, ClipboardList, ArrowRight, BarChart3,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Avatar, AvatarStack, Badge, EmptyState, Button } from '../components/ui';
import { STATUSES, STATUS_COLORS, STATUS_MAP } from '../lib/constants';
import { cx, fmt, timeAgo } from '../lib/utils';

const EASE = [0.16, 1, 0.3, 1];

const tooltipStyle = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 12,
  fontSize: 12,
  color: 'var(--text-primary)',
  boxShadow: 'var(--shadow-pop)',
};

/* ------------------------------ tiny count-up ------------------------------ */
function useCountUp(target) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const dur = 1100;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return [ref, value];
}

/* ------------------------------ bento tile ------------------------------ */
function Tile({ className, spotlight = false, sheen = true, children }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.22, ease: 'easeOut' } }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, ease: EASE }}
      onMouseMove={spotlight ? onMove : undefined}
      className={cx('bento-tile', sheen && 'bento-sheen', spotlight && 'bento-spotlight', className)}
    >
      {children}
    </motion.div>
  );
}

function TileHeader({ icon: Icon, title, sub, action, accent = 'teal' }) {
  const fill = accent === 'violet' ? 'fill-violet-soft text-violet' : accent === 'amber' ? 'fill-amber-soft text-amber' : accent === 'azure' ? 'fill-azure-soft text-azure' : 'fill-teal-soft text-teal';
  return (
    <div className="relative flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className={cx('grid h-8 w-8 place-items-center rounded-xl', fill)}>
            <Icon size={16} strokeWidth={2} />
          </span>
        )}
        <div>
          <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
          {sub && <p className="text-[11px] text-muted">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------ page ------------------------------ */
export function DashboardPage() {
  const activeWorkspace = useAppStore((s) => s.activeWorkspace());
  const activeProject = useAppStore((s) => s.activeProject());
  const issues = useAppStore((s) => s.issues);
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);

  const stats = useMemo(() => {
    if (!activeProject) return null;
    const mine = issues.filter((i) => i.projectId === activeProject.id);
    const open = mine.filter((i) => i.status !== 'done');
    const done = mine.filter((i) => i.status === 'done');

    // Cycle time: created → last entered Done (days)
    const cycleTimes = done
      .map((i) => {
        const doneAt = [...i.statusHistory].reverse().find((h) => h.to === 'done');
        const at = doneAt ? doneAt.at : i.updatedAt;
        return (new Date(at) - new Date(i.createdAt)) / 86_400_000;
      })
      .filter((d) => d >= 0);
    const avgCycle = cycleTimes.length ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length : 0;

    // Throughput: completed per day over the last 14 days
    const days = [];
    for (let d = 13; d >= 0; d--) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - d);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const completed = mine.filter((i) => {
        const doneAt = [...i.statusHistory].reverse().find((h) => h.to === 'done');
        const at = doneAt ? new Date(doneAt.at) : null;
        return at && at >= day && at < next;
      }).length;
      days.push({ label: fmt(day.toISOString(), 'MMM d'), completed });
    }

    const done7d = days.slice(-7).reduce((a, d) => a + d.completed, 0);

    // Distribution by status
    const distribution = STATUSES.map((s) => ({
      name: s.label,
      value: mine.filter((i) => i.status === s.id).length,
    }));

    // Recent status moves → activity timeline
    const activity = mine
      .flatMap((i) =>
        i.statusHistory.map((h) => ({ id: `${i.id}:${h.at}`, key: i.key, from: h.from, to: h.to, by: h.by, at: h.at }))
      )
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 8);

    // My issues (assigned to me)
    const myIssues = mine
      .filter((i) => i.assigneeId === currentUserId)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);

    // Team load
    const memberIds = activeProject.memberIds ?? [];
    const teamLoad = users
      .filter((u) => memberIds.includes(u.id))
      .map((u) => ({ user: u, open: mine.filter((i) => i.assigneeId === u.id && i.status !== 'done').length }))
      .sort((a, b) => b.open - a.open);

    return { mine, open, done, avgCycle, days, done7d, distribution, activity, myIssues, teamLoad };
  }, [activeProject, issues, users, currentUserId]);

  if (!activeProject || !stats) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <EmptyState tile icon={Gauge} title="Select a project" description="The dashboard is scoped to the active project — pick one from the sidebar." />
      </div>
    );
  }

  const total = stats.mine.length;
  const inProgress = stats.mine.filter((i) => i.status === 'in_progress').length;
  const review = stats.mine.filter((i) => i.status === 'review').length;
  const pctDone = total ? Math.round((stats.done.length / total) * 100) : 0;
  const maxLoad = Math.max(1, ...stats.teamLoad.map((t) => t.open));

  // Week-over-week insight for the AI strip
  const weekRecent = stats.days.slice(0, 7).reduce((a, d) => a + d.completed, 0);
  const weekPrev = stats.days.slice(7).reduce((a, d) => a + d.completed, 0);
  const delta = weekRecent - weekPrev;
  const busiest = stats.teamLoad[0]?.user?.name ?? '—';
  const insight = delta > 0
    ? `Throughput is up ${delta} vs the previous week — momentum looks good.`
    : delta < 0
      ? `Throughput dipped ${Math.abs(delta)} vs the previous week — worth a look at the backlog.`
      : `Throughput is steady week-over-week.`;
  const insightRest = stats.teamLoad.some((t) => t.open > 0) ? ` ${busiest} carries the most open issues.` : '';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = (users.find((u) => u.id === currentUserId)?.name ?? '').split(' ')[0] || 'there';

  const gridStroke = 'var(--border-subtle)';
  const tickFill = 'var(--text-muted)';

  const kpis = [
    { label: 'Open issues', icon: CircleDot, accent: 'azure', display: <CountValue value={stats.open.length} />, sub: `${stats.done.length} closed total` },
    { label: 'In progress', icon: Timer, accent: 'amber', display: <CountValue value={inProgress} />, sub: `${review} in review` },
    { label: 'Shipped · 7d', icon: CheckCircle2, accent: 'teal', display: <CountValue value={stats.done7d} />, sub: 'last 7 days' },
    { label: 'Avg cycle time', icon: TrendingUp, accent: 'violet', display: <span className="font-mono">{stats.avgCycle ? `${stats.avgCycle.toFixed(1)}d` : '—'}</span>, sub: 'creation → done' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl fill-teal-soft text-teal"><Gauge size={18} /></span>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Dashboard</h1>
          <p className="text-sm text-muted">{activeWorkspace?.name} / {activeProject.name} · live overview</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-card-60 px-3 py-1.5 text-[11px] font-medium text-muted backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
            {fmt(new Date().toISOString(), 'EEEE, MMM d')}
          </span>
        </div>
      </div>

      {/* =============================== Bento grid =============================== */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
        {/* ---- Hero ---- */}
        <Tile spotlight className="p-6 md:col-span-2 xl:col-span-7">
          <div className="bento-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full"
            aria-hidden="true"
            style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--signal-teal) 12%, transparent), transparent 70%)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full"
            aria-hidden="true"
            style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--signal-violet) 10%, transparent), transparent 70%)' }}
          />

          <div className="relative">
            <p className="brutal-stamp font-mono text-[11px] uppercase tracking-[0.2em] text-teal">
              <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-teal align-middle" />
              {activeProject.keyPrefix} · pipeline live
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-[34px]">
              {greeting}, {firstName}.
            </h2>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">
              <span className="font-semibold text-ink">{activeProject.name}</span> has {stats.open.length} open
              issue{stats.open.length === 1 ? '' : 's'} and {stats.done7d} shipped in the last week.
            </p>

            {/* Mini sparkline */}
            <div className="mt-4 h-16 max-w-md">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.days} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--signal-teal)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--signal-teal)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="completed" stroke="var(--signal-teal)" strokeWidth={2} fill="url(#heroSpark)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Link to="/app/board"><Button size="sm" iconRight={ArrowRight}>Open board</Button></Link>
              <Link to="/app/ai"><Button size="sm" variant="secondary" iconRight={Sparkles}>Ask the AI</Button></Link>
            </div>
          </div>
        </Tile>

        {/* ---- Pipeline health ---- */}
        <Tile spotlight className="p-6 md:col-span-2 xl:col-span-5">
          <TileHeader icon={Activity} title="Pipeline health" sub="Work by stage" accent="teal"
            action={<Badge variant="teal">{pctDone}% done</Badge>} />
          <div className="relative mt-5 space-y-4">
            {STATUSES.map((s) => {
              const count = stats.distribution.find((d) => d.name === s.label)?.value ?? 0;
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-[11px] font-medium text-muted">{s.label}</span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-raised">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.max(pct, count > 0 ? 6 : 0)}%`, background: STATUS_COLORS[s.id], opacity: 0.85 }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right font-mono text-[11px] font-semibold text-ink">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="relative mt-5 flex items-center gap-2 rounded-xl border border-line bg-card-60 px-3.5 py-2.5 text-[11px] text-muted">
            <TrendingUp size={13} className="text-teal" />
            {stats.open.length} open · {stats.done.length} shipped · avg cycle{' '}
            <span className="font-mono font-semibold text-ink">{stats.avgCycle ? `${stats.avgCycle.toFixed(1)}d` : '—'}</span>
          </div>
        </Tile>

        {/* ---- KPI tiles ---- */}
        {kpis.map((k) => (
          <Tile key={k.label} spotlight className="p-5 xl:col-span-3">
            <div className="flex items-center justify-between">
              <span className={cx('grid h-9 w-9 place-items-center rounded-xl',
                k.accent === 'azure' ? 'fill-azure-soft text-azure'
                  : k.accent === 'amber' ? 'fill-amber-soft text-amber'
                    : k.accent === 'violet' ? 'fill-violet-soft text-violet'
                      : 'fill-teal-soft text-teal')}>
                <k.icon size={17} strokeWidth={2} />
              </span>
              <span className="rounded-full bg-raised px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">{k.label}</span>
            </div>
            <div className="relative mt-4">
              <p className="font-mono text-[34px] font-bold leading-none tracking-tight text-ink">{k.display}</p>
              <p className="mt-1.5 text-[11px] text-muted">{k.sub}</p>
            </div>
          </Tile>
        ))}

        {/* ---- Throughput chart ---- */}
        <Tile className="p-6 md:col-span-2 xl:col-span-8">
          <TileHeader icon={TrendingUp} title="Throughput velocity" sub="Issues completed per day · last 14 days" accent="teal"
            action={<span className={cx('flex items-center gap-1 font-mono text-[11px] font-semibold', delta >= 0 ? 'text-teal' : 'text-coral')}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} vs prev wk
            </span>} />
          <div className="relative mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.days} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--signal-teal)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--signal-teal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: gridStroke }} />
                <Area type="monotone" dataKey="completed" stroke="var(--signal-teal)" strokeWidth={2.5} fill="url(#velGrad)" dot={{ r: 3, fill: 'var(--signal-teal)', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Tile>

        {/* ---- Status donut ---- */}
        <Tile className="p-6 md:col-span-2 xl:col-span-4">
          <TileHeader icon={BarChart3} title="Status mix" sub="Where work sits now" accent="azure" />
          <div className="relative mx-auto mt-2 h-40 max-w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="64%" outerRadius="92%" paddingAngle={3} stroke="none">
                  {stats.distribution.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[STATUSES[i].id]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-bold text-ink">{total}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted">issues</span>
            </div>
          </div>
          <div className="relative mt-3 space-y-1.5">
            {STATUSES.map((s, i) => {
              const count = stats.distribution[i].value;
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={s.id} className="flex items-center gap-2 text-[11px]">
                  <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[s.id] }} />
                  <span className="text-muted">{s.label}</span>
                  <span className="ml-auto font-mono font-semibold text-ink">{count}</span>
                  <span className="w-9 text-right font-mono text-muted">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Tile>

        {/* ---- Your issues ---- */}
        <Tile className="p-6 xl:col-span-4">
          <TileHeader icon={ClipboardList} title="Your issues" sub="Assigned to you" accent="amber"
            action={<Badge variant="neutral" size="sm">{stats.myIssues.length} shown</Badge>} />
          <div className="relative mt-4 space-y-2">
            {stats.myIssues.length === 0 && (
              <p className="rounded-xl border border-dashed border-line bg-card-60 px-3.5 py-6 text-center text-[12px] text-muted">
                Nothing assigned to you right now 🎉
              </p>
            )}
            {stats.myIssues.map((i) => (
              <Link
                key={i.id}
                to="/app/board"
                className="group flex items-center gap-3 rounded-xl border border-transparent bg-card-60 px-3 py-2.5 transition-colors hover:border-line hover:bg-raised"
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: STATUS_COLORS[i.status], boxShadow: `0 0 8px ${STATUS_COLORS[i.status]}` }} />
                <span className="w-16 shrink-0 font-mono text-[11px] font-semibold text-teal">{i.key}</span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink group-hover:text-teal">{i.title}</span>
                <span className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:block"
                  style={{ color: STATUS_COLORS[i.status], background: 'color-mix(in srgb, ' + STATUS_COLORS[i.status] + ' 12%, transparent)' }}>
                  {STATUS_MAP[i.status]?.label ?? i.status}
                </span>
              </Link>
            ))}
          </div>
        </Tile>

        {/* ---- Recent activity ---- */}
        <Tile className="p-6 xl:col-span-4">
          <TileHeader icon={Clock} title="Recent activity" sub="Latest status moves" accent="violet"
            action={<Badge variant="violet" size="sm">{stats.activity.length} events</Badge>} />
          <div className="relative mt-4 space-y-1">
            {stats.activity.map((a) => {
              const actor = users.find((u) => u.id === a.by);
              const toLabel = STATUS_MAP[a.to]?.label ?? a.to;
              return (
                <div key={a.id} className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-raised">
                  <Avatar user={actor} size={22} />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-muted">
                    <span className="font-mono font-semibold text-ink">{a.key}</span> → <span style={{ color: STATUS_COLORS[a.to] }}>{toLabel}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-muted">{timeAgo(a.at)}</span>
                </div>
              );
            })}
            {stats.activity.length === 0 && (
              <p className="rounded-xl border border-dashed border-line bg-card-60 px-3.5 py-6 text-center text-[12px] text-muted">No moves yet.</p>
            )}
          </div>
        </Tile>

        {/* ---- Team load ---- */}
        <Tile className="p-6 md:col-span-2 xl:col-span-4">
          <TileHeader icon={Users} title="Team load" sub="Open issues per member" accent="azure"
            action={<AvatarStack members={stats.teamLoad.map((t) => t.user)} limit={4} size={20} />} />
          <div className="relative mt-4 space-y-3">
            {stats.teamLoad.map(({ user, open }) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar user={user} size={24} showStatus />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[12.5px] font-medium text-ink">{user.name}</span>
                    <span className="shrink-0 font-mono text-[11px] font-semibold text-muted">{open} open</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-raised">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.round((open / maxLoad) * 100)}%`, background: open ? 'var(--signal-teal)' : 'var(--border-subtle)' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Tile>

        {/* ---- AI insight strip ---- */}
        <Tile spotlight className="p-5 md:col-span-2 xl:col-span-12">
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl fill-violet-soft text-violet">
              <Sparkles size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">AI insight</p>
              <p className="mt-0.5 text-[13px] text-muted">{insight}{insightRest}</p>
            </div>
            <Link to="/app/ai" className="focus-ring flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-violet transition-colors hover:bg-raised">
              Ask the AI <ArrowRight size={14} />
            </Link>
          </div>
        </Tile>
      </div>
    </div>
  );
}

function CountValue({ value }) {
  const [ref, count] = useCountUp(value);
  return <span ref={ref}>{count}</span>;
}
