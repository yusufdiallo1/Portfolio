"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { GlassCard } from "@/components/ui/glass-card";
import type { DashboardReferral } from "@/lib/dashboard-queries";
import { cn } from "@/lib/utils";

const STATUSES = ["pending", "converted", "rewarded"] as const;

const inputClass =
  "w-full rounded-md border border-[var(--glass-border)] bg-black/80 px-2 py-1.5 font-label text-xs text-white outline-none focus:border-[var(--react)]";

function statusStyle(s: string) {
  switch (s) {
    case "pending":
      return "border-[var(--js)]/50 text-[var(--js)]";
    case "converted":
      return "border-[var(--react)]/50 text-[var(--react)]";
    case "rewarded":
      return "border-[var(--go)]/50 text-[var(--go)]";
    default:
      return "border-[var(--glass-border)] text-[var(--text-secondary)]";
  }
}

export function ReferralsManager({ initialRows }: { initialRows: DashboardReferral[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const updateStatus = async (id: string, status: (typeof STATUSES)[number]) => {
    const res = await fetch(`/api/dashboard/referrals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Could not update status");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success("Status updated");
    router.refresh();
  };

  return (
    <GlassCard disableHoverScale className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left font-label text-sm">
          <thead>
            <tr className="border-b border-[var(--glass-border)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              <th className="px-4 py-3">Referrer</th>
              <th className="px-4 py-3">Referrer email</th>
              <th className="px-4 py-3">Referred</th>
              <th className="px-4 py-3">Referred email</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[var(--text-muted)]">
                  No referrals yet
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--glass-border)]/40">
                  <td className="px-4 py-3 text-white">{r.referrer_name}</td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-[var(--text-secondary)]">{r.referrer_email}</td>
                  <td className="px-4 py-3 text-white">{r.referred_name}</td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-[var(--text-secondary)]">{r.referred_email}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-[var(--text-muted)]">{r.message ?? "—"}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      className={cn(inputClass, statusStyle(r.status))}
                      value={r.status}
                      onChange={(e) =>
                        void updateStatus(r.id, e.target.value as (typeof STATUSES)[number])
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-black text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--text-muted)]">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
