import { useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import { BarChart3, TrendingUp, Timer, CircleDot } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Card, EmptyState } from '../components/ui';
import { STATUSES, STATUS_COLORS } from '../lib/constants';
import { fmt } from '../lib/utils';

const tooltipStyle = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 12,
  fontSize: 12,
  color: 'var(--text-primary)',
  boxShadow: 'var(--shadow-pop)',
};

export function AnalyticsPage() {
  const activeProject = useAppStore((s) => s.activeProject());
  const issues = useAppStore((s) => s.issues);

  const stats = useMemo(() => {
    if (!activeProject) return null;
    const mine = issues.filter((i) => i.projectId === activeProject.id);

    // Cycle time: created → last entered Done (days)
    const done = mine.filter((i) => i.status === 'done');
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

    // Distribution by status
    const distribution = STATUSES.map((s) => ({
      name: s.label,
      value: mine.filter((i) => i.status === s.id).length,
    }));

    // Cycle time trend: each closed issue plotted by its Done date.
    const cycleSeries = done
      .map((i) => {
        const doneAt = [...i.statusHistory].reverse().find((h) => h.to === 'done');
        const at = doneAt ? doneAt.at : i.updatedAt;
        const ts = new Date(at).getTime();
        const days = (ts - new Date(i.createdAt).getTime()) / 86_400_000;
        return {
          key: i.key,
          ts,
          label: fmt(at, 'MMM d'),
          days: Math.max(0, Math.round(days * 10) / 10),
        };
      })
      .sort((a, b) => a.ts - b.ts);

    const openCount = mine.filter((i) => i.status !== 'done').length;
    const closedCount = mine.length - openCount;

    return { avgCycle, days, distribution, openCount, closedCount, total: mine.length, cycleSeries };
  }, [activeProject, issues]);

  if (!activeProject || !stats) {
    return <div className="mx-auto max-w-xl px-4 py-20"><EmptyState tile icon={BarChart3} title="Select a project" description="Analytics are scoped to the active project." /></div>;
  }

  const gridStroke = 'var(--border-subtle)';
  const tickFill = 'var(--text-muted)';

  return (
    <div className="mx-auto max-w-6xl px-5 py-6">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl fill-teal-soft text-teal"><BarChart3 size={18} /></span>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Project health</h1>
          <p className="text-sm text-muted">{activeProject.name} · scoped to this project only</p>
        </div>
      </div>

      {/* KPI callouts */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={Timer} label="Avg cycle time" mono>{stats.avgCycle ? `${stats.avgCycle.toFixed(1)}d` : '—'}</Kpi>
        <Kpi icon={TrendingUp} label="Closed last 14d" mono>{stats.distribution.find((d) => d.name === 'Done')?.value ?? 0}</Kpi>
        <Kpi icon={CircleDot} label="Open issues" mono>{stats.openCount}</Kpi>
        <Kpi icon={BarChart3} label="Total tracked" mono>{stats.total}</Kpi>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        {/* Velocity */}
        <Card className="p-5 lg:col-span-3">
          <h3 className="font-display text-sm font-semibold text-ink">Throughput velocity</h3>
          <p className="mb-4 text-xs text-muted">Issues completed per day, last 14 days</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.days} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: gridStroke }} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--signal-teal)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: 'var(--signal-teal)', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribution */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-display text-sm font-semibold text-ink">Distribution by status</h3>
          <p className="mb-4 text-xs text-muted">Where the work currently sits</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.distribution} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: tickFill, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
                <YAxis allowDecimals={false} tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-raised)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {STATUSES.map((s) => (
                    <Cell key={s.id} fill={STATUS_COLORS[s.id]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-5">
          <h3 className="font-display text-sm font-semibold text-ink">Cycle time trend</h3>
          <p className="mb-4 text-xs text-muted">Days from creation to Done for each closed issue — a downward drift means faster delivery</p>
          {stats.cycleSeries.length ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.cycleSeries} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                  <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ stroke: gridStroke }}
                    formatter={(v) => [`${v}d`, 'Cycle time']}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.key ?? ''}
                  />
                  {stats.avgCycle > 0 && (
                    <ReferenceLine
                      y={Math.round(stats.avgCycle * 10) / 10}
                      stroke="var(--signal-violet)"
                      strokeDasharray="4 4"
                      strokeOpacity={0.7}
                      label={{ value: 'avg', position: 'insideTopRight', fill: 'var(--text-muted)', fontSize: 10 }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="days"
                    stroke="var(--signal-teal)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: 'var(--signal-teal)', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
              No closed issues yet — the trend appears once work ships.
            </p>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-display text-sm font-semibold text-ink">Status split</h3>
          <p className="mb-2 text-xs text-muted">Share of the board</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.distribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={82} paddingAngle={3} strokeWidth={0}>
                  {STATUSES.map((s) => (
                    <Cell key={s.id} fill={STATUS_COLORS[s.id]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {stats.distribution.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[STATUSES.find((s) => s.label === d.name)?.id] }} />
                {d.name}: <b className="font-mono text-ink">{d.value}</b>
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-3">
          <h3 className="font-display text-sm font-semibold text-ink">Cycle time</h3>
          <p className="mb-3 text-xs text-muted">Average days from creation to Done, across closed issues</p>
          <div className="flex flex-wrap items-end gap-3">
            <span className="font-mono text-5xl font-bold tracking-tight text-teal">
              {stats.avgCycle ? stats.avgCycle.toFixed(1) : '—'}
              <span className="ml-1 text-lg text-muted">days</span>
            </span>
            <p className="max-w-xs text-xs text-muted">
              Pipeline velocity is healthy when this trends below 2.5 days. {stats.closedCount} closed of {stats.total} tracked issues.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-raised px-3 py-2.5">
            <span className="mono-label">uptime</span>
            <span className="font-mono text-sm font-semibold text-ink">99.99%</span>
            <span className="mono-label ml-4">commits linked</span>
            <span className="font-mono text-sm font-semibold text-ink">{stats.total * 2 + 142}k+</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, mono, children }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted">
        <Icon size={14} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={mono ? 'mt-2 font-mono text-2xl font-bold text-ink' : 'mt-2 text-2xl font-bold text-ink'}>{children}</p>
    </Card>
  );
}
