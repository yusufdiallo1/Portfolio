"use client";

import {
  BrainCircuit,
  Briefcase,
  LineChart as LineChartIcon,
  MessageSquare,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { GlassCard } from "@/components/ui/glass-card";
import { TechBadge } from "@/components/ui/tech-badge";
import { cn } from "@/lib/utils";
import type { DashboardOverviewData } from "@/lib/dashboard-stats";

type Props = {
  data: DashboardOverviewData;
};

function formatShortDate(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tintVar,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  tintVar: string;
  trend?: { dir: "up" | "down" | "flat"; pct: number | null };
}) {
  return (
    <GlassCard disableHoverScale glow={tintVar} className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
          <p className="font-display mt-2 text-4xl tracking-tight text-white">{value}</p>
          {sub && <div className="mt-1 font-label text-xs text-[var(--text-secondary)]">{sub}</div>}
          {trend && trend.pct !== null && (
            <p
              className={cn(
                "mt-2 font-label text-xs",
                trend.dir === "up" && "text-[var(--go)]",
                trend.dir === "down" && "text-[var(--rust)]",
                trend.dir === "flat" && "text-[var(--text-muted)]"
              )}
            >
              {trend.dir === "up" ? "↑" : trend.dir === "down" ? "↓" : "→"}{" "}
              {Math.abs(trend.pct).toFixed(0)}% vs prev 30d
            </p>
          )}
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-black/30"
          style={{ color: `color-mix(in srgb, ${tintVar} 90%, white)` }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </GlassCard>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number; name?: string; color?: string; dataKey?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const l = label ? formatShortDate(label) : "";
  return (
    <div className="glass-strong rounded-xl border border-[var(--glass-border)] px-3 py-2 font-label text-xs shadow-xl backdrop-blur-md">
      <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{l}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey ?? p.name)} className="flex items-center gap-2 text-[var(--text-primary)]">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}: {p.value ?? 0}
        </p>
      ))}
    </div>
  );
}

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; payload?: { fill?: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="glass-strong rounded-xl border border-[var(--glass-border)] px-3 py-2 font-label text-xs backdrop-blur-md">
      <span className="text-[var(--text-primary)]">
        {p.name}: {p.value}
      </span>
    </div>
  );
}

function hireStatusStyle(status: string) {
  switch (status) {
    case "new":
      return "border-[var(--js)]/50 bg-[color-mix(in_srgb,var(--js)_18%,transparent)] text-[var(--js)]";
    case "reviewing":
      return "border-[var(--react)]/50 bg-[color-mix(in_srgb,var(--react)_14%,transparent)] text-[var(--react)]";
    case "accepted":
      return "border-[var(--go)]/50 bg-[color-mix(in_srgb,var(--go)_14%,transparent)] text-[var(--go)]";
    case "declined":
      return "border-[var(--rust)]/50 bg-[color-mix(in_srgb,var(--rust)_14%,transparent)] text-[var(--rust)]";
    default:
      return "border-[var(--glass-border)] bg-white/5 text-[var(--text-secondary)]";
  }
}

export function DashboardOverviewClient({ data }: Props) {
  const pvPrev = data.pageViewsPrev30;
  const pvCurr = data.pageViews30;
  let trendPct: number | null = null;
  let trendDir: "up" | "down" | "flat" = "flat";
  if (pvPrev > 0) {
    trendPct = ((pvCurr - pvPrev) / pvPrev) * 100;
    trendDir = trendPct > 0.5 ? "up" : trendPct < -0.5 ? "down" : "flat";
  } else if (pvCurr > 0) {
    trendPct = 100;
    trendDir = "up";
  }

  const lineData = data.activitySeries;

  const donutData = data.hireByType;
  const hireTotal = donutData.reduce((s, x) => s + x.value, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Page Views"
          value={data.pageViews30}
          icon={LineChartIcon}
          tintVar="var(--react)"
          trend={trendPct !== null ? { dir: trendDir, pct: trendPct } : undefined}
        />
        <StatCard
          label="AI Chats"
          value={data.aiChats30}
          icon={BrainCircuit}
          tintVar="var(--go)"
        />
        <StatCard
          label="Messages"
          value={data.contactsTotal}
          sub={
            <>
              <span className="text-[var(--js)]">{data.contactsUnread} unread</span>
              {" / "}
              {data.contactsTotal} total
            </>
          }
          icon={MessageSquare}
          tintVar="var(--js)"
        />
        <StatCard
          label="Hire Requests"
          value={data.hireTotal}
          sub={
            <>
              <span className="text-[var(--rust)]">{data.hireNew} new</span>
              {" / "}
              {data.hireTotal} total
            </>
          }
          icon={Briefcase}
          tintVar="var(--rust)"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <GlassCard disableHoverScale className="p-4 lg:col-span-3">
          <p className="mb-4 font-label text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
            Activity · Last 30 Days
          </p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatShortDate(String(v))}
                  stroke="rgba(255,255,255,0.25)"
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "var(--font-label)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.25)"
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="page_views"
                  name="Page views"
                  stroke="#ffffff"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="ai_chats"
                  name="AI chats"
                  stroke="var(--react)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard disableHoverScale className="p-4 lg:col-span-2">
          <p className="mb-2 font-label text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
            Hire Requests by Type
          </p>
          <div className="flex h-[280px] items-center justify-center">
            {donutData.length === 0 ? (
              <p className="font-label text-sm text-[var(--text-muted)]">No hire requests yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={56}
                    outerRadius={88}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                  <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" fill="var(--text-primary)" fontSize={28} fontFamily="var(--font-display), serif">
                    {hireTotal}
                  </text>
                  <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.25)" fontSize={10} fontFamily="var(--font-label), monospace" letterSpacing="0.08em">
                    TOTAL
                  </text>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard disableHoverScale className="overflow-hidden p-0">
          <div className="border-b border-[var(--glass-border)] px-4 py-3 font-label text-xs uppercase tracking-wider text-[var(--text-muted)]">
            Recent Contacts
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-left font-label text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentContacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-[var(--text-muted)]">
                      No messages yet
                    </td>
                  </tr>
                ) : (
                  data.recentContacts.map((c) => (
                    <tr key={c.id} className="border-t border-[var(--glass-border)]/60">
                      <td className="px-4 py-3 text-white">{c.name}</td>
                      <td className="max-w-[140px] truncate px-4 py-3 text-[var(--text-secondary)]">{c.email}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-[var(--text-muted)]">
                        {new Date(c.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase",
                            c.read
                              ? "border-white/15 bg-white/5 text-[var(--text-secondary)]"
                              : "border-[var(--rust)]/40 bg-[color-mix(in_srgb,var(--rust)_12%,transparent)] text-[var(--rust)]"
                          )}
                        >
                          {c.read ? "Read" : "Unread"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard disableHoverScale className="overflow-hidden p-0">
          <div className="border-b border-[var(--glass-border)] px-4 py-3 font-label text-xs uppercase tracking-wider text-[var(--text-muted)]">
            Recent Hire Requests
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-left font-label text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Budget</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentHires.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-[var(--text-muted)]">
                      No hire requests yet
                    </td>
                  </tr>
                ) : (
                  data.recentHires.map((h) => (
                    <tr key={h.id} className="border-t border-[var(--glass-border)]/60">
                      <td className="px-4 py-3 text-white">{h.name}</td>
                      <td className="px-4 py-3">
                        <TechBadge tech={h.project_type || "—"} size="sm" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[var(--text-secondary)]">{h.budget}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase",
                            hireStatusStyle(h.status)
                          )}
                        >
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
