"use client";

import { Edit2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { AccentButton } from "@/components/ui/accent-button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/glass-card";
import { TechBadge } from "@/components/ui/tech-badge";
import type { DashboardHireRequest, RevenueEntry } from "@/lib/dashboard-queries";
import { cn } from "@/lib/utils";

const PROJECT_TYPES = [
  "Full Stack App",
  "Landing Page",
  "E-commerce",
  "Dashboard",
  "API Integration",
  "Mobile App",
  "Other",
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"];

const CHART_COLORS = [
  "var(--react)",
  "var(--ts)",
  "var(--js)",
  "var(--go)",
  "var(--css)",
  "var(--rust)",
];

const inputClass =
  "w-full rounded-lg border border-[var(--glass-border)] bg-black/65 px-3 py-2.5 font-label text-sm text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--react)] focus:ring-1 focus:ring-[var(--react)]";

function fmt(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function statusPill(status: RevenueEntry["status"]) {
  switch (status) {
    case "paid":
      return "border-[var(--go)]/50 bg-[color-mix(in_srgb,var(--go)_14%,transparent)] text-[var(--go)]";
    case "pending":
      return "border-[var(--js)]/50 bg-[color-mix(in_srgb,var(--js)_14%,transparent)] text-[var(--js)]";
    case "refunded":
      return "border-[var(--rust)]/50 bg-[color-mix(in_srgb,var(--rust)_14%,transparent)] text-[var(--rust)]";
  }
}

type FormState = {
  client_name: string;
  project_title: string;
  project_type: string;
  amount: string;
  currency: string;
  status: "paid" | "pending" | "refunded";
  hire_request_id: string;
  completed_at: string;
  notes: string;
};

const emptyForm = (): FormState => ({
  client_name: "",
  project_title: "",
  project_type: "",
  amount: "",
  currency: "USD",
  status: "paid",
  hire_request_id: "",
  completed_at: new Date().toISOString().slice(0, 10),
  notes: "",
});

function buildMonthlyData(entries: RevenueEntry[]) {
  const now = new Date();
  const months: { label: string; key: string; total: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    months.push({ key, label, total: 0 });
  }
  for (const e of entries) {
    if (e.status === "refunded") continue;
    const key = e.completed_at.slice(0, 7);
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.total += Number(e.amount);
  }
  return months;
}

/* ── Log Payment Modal ───────────────────────────────────────── */
function PaymentModal({
  open,
  onClose,
  editing,
  hireRequests,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editing: RevenueEntry | null;
  hireRequests: DashboardHireRequest[];
  onSaved: (entry: RevenueEntry) => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  // Populate form when editing changes
  useMemo(() => {
    if (editing) {
      setForm({
        client_name: editing.client_name,
        project_title: editing.project_title,
        project_type: editing.project_type ?? "",
        amount: String(editing.amount),
        currency: editing.currency,
        status: editing.status,
        hire_request_id: editing.hire_request_id ?? "",
        completed_at: editing.completed_at,
        notes: editing.notes ?? "",
      });
    } else {
      setForm(emptyForm());
    }
  }, [editing]);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    const amount = parseFloat(form.amount);
    if (!form.client_name || !form.project_title || isNaN(amount) || !form.completed_at) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/dashboard/revenue/${editing.id}` : "/api/dashboard/revenue";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: form.client_name,
          project_title: form.project_title,
          project_type: form.project_type || null,
          amount,
          currency: form.currency,
          status: form.status,
          hire_request_id: form.hire_request_id || null,
          completed_at: form.completed_at,
          notes: form.notes || null,
        }),
      });
      const json = (await res.json()) as { entry?: RevenueEntry; ok?: boolean; error?: string };
      if (!res.ok) { toast.error(json.error ?? "Save failed"); return; }

      if (editing) {
        onSaved({ ...editing, ...form, amount, hire_request_id: form.hire_request_id || null, notes: form.notes || null, project_type: form.project_type || null });
      } else {
        onSaved(json.entry!);
      }
      toast.success(editing ? "Entry updated." : "Payment logged.");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {editing ? "Edit Entry" : "Log Payment"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="grid grid-cols-2 gap-3">
            <label className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              Client Name *
              <input className={cn(inputClass, "mt-1")} value={form.client_name} onChange={(e) => set("client_name", e.target.value)} placeholder="ACME Corp" />
            </label>
            <label className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              Project Title *
              <input className={cn(inputClass, "mt-1")} value={form.project_title} onChange={(e) => set("project_title", e.target.value)} placeholder="Portfolio Redesign" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              Project Type
              <select className={cn(inputClass, "mt-1")} value={form.project_type} onChange={(e) => set("project_type", e.target.value)}>
                <option value="" className="bg-black">— Select —</option>
                {PROJECT_TYPES.map((t) => <option key={t} value={t} className="bg-black">{t}</option>)}
              </select>
            </label>
            <label className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              Date *
              <input type="date" className={cn(inputClass, "mt-1")} value={form.completed_at} onChange={(e) => set("completed_at", e.target.value)} />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="col-span-2 font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              Amount *
              <input type="number" min="0" step="0.01" className={cn(inputClass, "mt-1")} value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="2500" />
            </label>
            <label className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              Currency
              <select className={cn(inputClass, "mt-1")} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                {CURRENCIES.map((c) => <option key={c} value={c} className="bg-black">{c}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              Status
              <select className={cn(inputClass, "mt-1")} value={form.status} onChange={(e) => set("status", e.target.value as FormState["status"])}>
                <option value="paid" className="bg-black">Paid</option>
                <option value="pending" className="bg-black">Pending</option>
                <option value="refunded" className="bg-black">Refunded</option>
              </select>
            </label>
            <label className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              Linked Hire Request
              <select className={cn(inputClass, "mt-1")} value={form.hire_request_id} onChange={(e) => set("hire_request_id", e.target.value)}>
                <option value="" className="bg-black">— None —</option>
                {hireRequests.map((h) => (
                  <option key={h.id} value={h.id} className="bg-black">{h.name} — {h.project_type ?? "Project"}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Notes
            <textarea className={cn(inputClass, "mt-1 min-h-[64px] resize-none")} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any additional context…" />
          </label>
        </div>

        <DialogFooter>
          <AccentButton variant="ghost" onClick={onClose}>Cancel</AccentButton>
          <AccentButton variant="filled" disabled={saving} onClick={() => void save()}>
            {saving ? "Saving…" : editing ? "Update →" : "Log Payment →"}
          </AccentButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export function RevenueManager({
  initialEntries,
  hireRequests,
}: {
  initialEntries: RevenueEntry[];
  hireRequests: DashboardHireRequest[];
}) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RevenueEntry | null>(null);

  const totalEarned = useMemo(
    () => entries.filter((e) => e.status !== "refunded").reduce((sum, e) => sum + Number(e.amount), 0),
    [entries]
  );

  const pendingTotal = useMemo(
    () => entries.filter((e) => e.status === "pending").reduce((sum, e) => sum + Number(e.amount), 0),
    [entries]
  );

  const avgValue = useMemo(() => {
    const paid = entries.filter((e) => e.status === "paid");
    return paid.length ? paid.reduce((s, e) => s + Number(e.amount), 0) / paid.length : 0;
  }, [entries]);

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const thisMonth = useMemo(
    () => entries.filter((e) => e.status !== "refunded" && e.completed_at.startsWith(thisMonthKey)).reduce((s, e) => s + Number(e.amount), 0),
    [entries, thisMonthKey]
  );
  const lastMonth = useMemo(
    () => entries.filter((e) => e.status !== "refunded" && e.completed_at.startsWith(lastMonthKey)).reduce((s, e) => s + Number(e.amount), 0),
    [entries, lastMonthKey]
  );
  const monthTrend = lastMonth === 0 ? null : ((thisMonth - lastMonth) / lastMonth) * 100;

  const chartData = useMemo(() => buildMonthlyData(entries), [entries]);

  const openLog = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (e: RevenueEntry) => { setEditing(e); setModalOpen(true); };

  const onSaved = (entry: RevenueEntry) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === entry.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = entry; return next; }
      return [entry, ...prev];
    });
    router.refresh();
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/dashboard/revenue/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Delete failed"); return; }
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success("Entry deleted.");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassCard disableHoverScale className="p-5">
          <p className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Total Earned</p>
          <p className="mt-2 font-display text-3xl font-normal tracking-tight" style={{ color: "var(--go)" }}>
            {fmt(totalEarned)}
          </p>
          <p className="mt-1 font-label text-xs text-[var(--text-muted)]">all time</p>
        </GlassCard>

        <GlassCard disableHoverScale className="p-5">
          <p className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">This Month</p>
          <p className="mt-2 font-display text-3xl font-normal tracking-tight text-white">
            {fmt(thisMonth)}
          </p>
          {monthTrend !== null && (
            <p className={cn("mt-1 font-label text-xs", monthTrend >= 0 ? "text-[var(--go)]" : "text-[var(--rust)]")}>
              {monthTrend >= 0 ? "▲" : "▼"} {Math.abs(monthTrend).toFixed(0)}% vs last month
            </p>
          )}
        </GlassCard>

        <GlassCard disableHoverScale className="p-5">
          <p className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Avg Project Value</p>
          <p className="mt-2 font-display text-3xl font-normal tracking-tight text-white">
            {fmt(avgValue)}
          </p>
          <p className="mt-1 font-label text-xs text-[var(--text-muted)]">paid projects</p>
        </GlassCard>

        <GlassCard disableHoverScale className="p-5">
          <p className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Pending</p>
          <p className="mt-2 font-display text-3xl font-normal tracking-tight" style={{ color: "var(--js)" }}>
            {fmt(pendingTotal)}
          </p>
          <p className="mt-1 font-label text-xs text-[var(--text-muted)]">awaiting payment</p>
        </GlassCard>
      </div>

      {/* Chart */}
      <GlassCard disableHoverScale className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-label text-sm text-[var(--text-secondary)]">Monthly Revenue — Last 12 Months</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              width={42}
            />
            <Tooltip
              contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 12 }}
              labelStyle={{ color: "var(--text-muted)" }}
              formatter={(v) => [fmt(Number(v ?? 0)), "Revenue"]}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-label text-sm text-[var(--text-secondary)]">
            Entries ({entries.length})
          </p>
          <AccentButton variant="filled" className="font-label text-xs" onClick={openLog}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Log Payment
          </AccentButton>
        </div>

        <GlassCard disableHoverScale className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left font-label text-sm">
              <thead>
                <tr className="border-b border-[var(--glass-border)] text-[10px] uppercase text-[var(--text-muted)]">
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-[var(--text-muted)]">
                      No entries yet. Log your first payment →
                    </td>
                  </tr>
                ) : (
                  entries.map((e) => (
                    <tr key={e.id} className="border-b border-[var(--glass-border)]/40 hover:bg-white/[0.03]">
                      <td className="px-4 py-3 text-white">{e.client_name}</td>
                      <td className="max-w-[160px] truncate px-4 py-3 text-[var(--text-secondary)]">{e.project_title}</td>
                      <td className="px-4 py-3">
                        {e.project_type ? <TechBadge tech={e.project_type} size="sm" /> : <span className="text-[var(--text-muted)]">—</span>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-[var(--go)]">
                        {fmt(e.amount, e.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase", statusPill(e.status))}>
                          {e.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[var(--text-muted)]">
                        {new Date(e.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="max-w-[140px] truncate px-4 py-3 text-[var(--text-muted)]">
                        {e.notes ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(e)}
                            className="rounded p-1 text-[var(--text-muted)] transition-colors hover:text-[var(--react)]"
                            aria-label="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteEntry(e.id)}
                            className="rounded p-1 text-[var(--text-muted)] transition-colors hover:text-[var(--rust)]"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      <PaymentModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        editing={editing}
        hireRequests={hireRequests}
        onSaved={onSaved}
      />
    </div>
  );
}
