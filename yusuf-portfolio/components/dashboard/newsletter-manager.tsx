"use client";

import { Download, Mail, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { cn } from "@/lib/utils";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  confirmed: boolean;
  created_at: string;
};

const inputClass =
  "w-full rounded-lg border border-[var(--glass-border)] bg-black/65 px-3 py-2.5 font-label text-sm text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--react)] focus:ring-1 focus:ring-[var(--react)]";

function exportCSV(subscribers: Subscriber[]) {
  const rows = [
    ["email", "name", "confirmed", "joined"].join(","),
    ...subscribers.map((s) =>
      [
        `"${s.email}"`,
        `"${s.name ?? ""}"`,
        s.confirmed ? "yes" : "no",
        new Date(s.created_at).toLocaleDateString(),
      ].join(",")
    ),
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function NewsletterManager({
  initialSubscribers,
}: {
  initialSubscribers: Subscriber[];
}) {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendForm, setSendForm] = useState({ subject: "", body: "", previewText: "" });
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const total = subscribers.length;
  const confirmed = subscribers.filter((s) => s.confirmed).length;

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/dashboard/newsletter?id=${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Could not delete subscriber"); return; }
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      toast.success("Subscriber removed");
    } finally {
      setDeleting(null);
    }
  };

  const handleSend = async () => {
    if (!sendForm.subject.trim() || !sendForm.body.trim()) {
      toast.error("Subject and body are required");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/dashboard/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendForm),
      });
      const json = await res.json() as { ok: boolean; sent?: number; error?: string; message?: string };
      if (!res.ok) {
        toast.error(json.error ?? "Send failed");
        return;
      }
      toast.success(
        json.message ?? `Sent to ${json.sent ?? 0} confirmed subscriber${(json.sent ?? 0) !== 1 ? "s" : ""}`
      );
      setSendOpen(false);
      setSendForm({ subject: "", body: "", previewText: "" });
      router.refresh();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Total", value: total, color: "var(--react)" },
          { label: "Confirmed", value: confirmed, color: "var(--go)" },
          { label: "Pending", value: total - confirmed, color: "var(--js)" },
        ].map((stat) => (
          <GlassCard key={stat.label} disableHoverScale className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              {stat.label}
            </p>
            <p
              className="mt-1.5 font-display text-3xl font-normal"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <AccentButton
          variant="filled"
          type="button"
          className="font-label text-xs"
          onClick={() => exportCSV(subscribers)}
          disabled={total === 0}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </AccentButton>
        <AccentButton
          variant="ghost"
          type="button"
          className="font-label text-xs"
          onClick={() => setSendOpen(true)}
          disabled={confirmed === 0}
        >
          <Send className="h-3.5 w-3.5" />
          Send Newsletter
        </AccentButton>
      </div>

      {/* Table */}
      <GlassCard disableHoverScale className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left font-label text-sm">
            <thead>
              <tr className="border-b border-[var(--glass-border)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[var(--text-muted)]">
                    <Mail className="mx-auto mb-2 h-6 w-6 opacity-30" />
                    No subscribers yet
                  </td>
                </tr>
              ) : (
                subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--glass-border)]/50">
                    <td className="px-4 py-3 font-medium text-white">{s.email}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{s.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px]",
                          s.confirmed
                            ? "border border-[color-mix(in_srgb,#34c759_40%,transparent)] bg-[color-mix(in_srgb,#34c759_15%,transparent)] text-[#34c759]"
                            : "border border-[var(--glass-border)] bg-white/5 text-[var(--text-muted)]"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            s.confirmed ? "bg-[#34c759]" : "bg-[var(--text-muted)]"
                          )}
                        />
                        {s.confirmed ? "confirmed" : "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={deleting === s.id}
                        onClick={() => void handleDelete(s.id)}
                        className="rounded p-2 text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--rust)] disabled:opacity-40"
                        aria-label="Remove subscriber"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Send modal */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="max-h-[min(90vh,600px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Send Newsletter</DialogTitle>
          </DialogHeader>
          <p className="font-label text-xs text-[var(--text-muted)]">
            Sending to {confirmed} confirmed subscriber{confirmed !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-3 pt-2">
            <label className="font-label text-[11px] uppercase text-[var(--text-muted)]">
              Subject *
              <input
                className={cn(inputClass, "mt-1")}
                placeholder="What's new this week?"
                value={sendForm.subject}
                onChange={(e) => setSendForm((f) => ({ ...f, subject: e.target.value }))}
              />
            </label>
            <label className="font-label text-[11px] uppercase text-[var(--text-muted)]">
              Preview text
              <input
                className={cn(inputClass, "mt-1")}
                placeholder="Short preview shown in inbox…"
                value={sendForm.previewText}
                onChange={(e) => setSendForm((f) => ({ ...f, previewText: e.target.value }))}
              />
            </label>
            <label className="font-label text-[11px] uppercase text-[var(--text-muted)]">
              Body *
              <textarea
                className={cn(inputClass, "mt-1 min-h-[160px] resize-y")}
                placeholder="Write your newsletter content here…"
                value={sendForm.body}
                onChange={(e) => setSendForm((f) => ({ ...f, body: e.target.value }))}
              />
            </label>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <AccentButton variant="ghost" type="button" onClick={() => setSendOpen(false)}>
              Cancel
            </AccentButton>
            <AccentButton
              variant="filled"
              type="button"
              disabled={sending}
              onClick={() => void handleSend()}
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                  Sending…
                </span>
              ) : (
                "Send →"
              )}
            </AccentButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
