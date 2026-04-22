"use client";

import { Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
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
import type { ClientNote, DashboardContactMessage, DashboardHireRequest } from "@/lib/dashboard-queries";
import { cn } from "@/lib/utils";

const HIRE_STATUSES = ["new", "reviewing", "accepted", "declined"] as const;

function hireStatusClass(s: string) {
  switch (s) {
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

const inputClass =
  "w-full rounded-lg border border-[var(--glass-border)] bg-black/80 px-2 py-1.5 font-label text-xs text-white outline-none focus:border-[var(--react)]";

type Props = {
  initialMessages: DashboardContactMessage[];
  initialHires: DashboardHireRequest[];
};

type ReplyTarget =
  | { recordType: "contact"; recordId: string; toName: string; toEmail: string; subject: string }
  | { recordType: "hire"; recordId: string; toName: string; toEmail: string; subject: string };

/* ── Client Notes Panel ──────────────────────────────────────── */
function ClientNotesPanel({ hireId }: { hireId: string }) {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const initialized = useRef<string | null>(null);

  useEffect(() => {
    if (initialized.current === hireId) return;
    initialized.current = hireId;
    setNotes([]);
    setDraft("");
    setLoading(true);

    void fetch(`/api/dashboard/hire-requests/${hireId}/notes`)
      .then((r) => r.json())
      .then((d: { notes?: ClientNote[] }) => {
        setNotes(d.notes ?? []);
      })
      .catch(() => toast.error("Could not load notes"))
      .finally(() => setLoading(false));
  }, [hireId]);

  const addNote = async () => {
    const text = draft.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/client-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hire_request_id: hireId, note: text }),
      });
      const json = (await res.json()) as { note?: ClientNote; error?: string };
      if (!res.ok) { toast.error(json.error ?? "Could not add note"); return; }
      setNotes((prev) => [json.note!, ...prev]);
      setDraft("");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteNote = async (id: string) => {
    const res = await fetch(`/api/dashboard/client-notes/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Could not delete note"); return; }
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="mt-5 border-t border-[var(--glass-border)]/40 pt-4">
      <p className="mb-3 font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        Notes ({notes.length})
      </p>

      {loading ? (
        <p className="font-label text-xs text-[var(--text-muted)]">Loading…</p>
      ) : notes.length === 0 ? (
        <p className="font-label text-xs text-[var(--text-muted)]">No notes yet.</p>
      ) : (
        <div className="mb-3 space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {notes.map((n) => (
            <div
              key={n.id}
              className="group relative rounded-lg border border-[var(--glass-border)]/50 bg-white/[0.03] p-2.5"
            >
              <p className="font-mono text-[11px] leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
                {n.note}
              </p>
              <p className="mt-1 font-label text-[10px] text-[var(--text-muted)]">
                {new Date(n.created_at).toLocaleString()}
              </p>
              <button
                type="button"
                onClick={() => void deleteNote(n.id)}
                className="absolute right-2 top-2 hidden rounded p-0.5 text-[var(--rust)] opacity-70 hover:opacity-100 group-hover:flex"
                aria-label="Delete note"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <textarea
        className={cn(inputClass, "min-h-[72px] resize-none")}
        placeholder="Add a note…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void addNote();
        }}
      />
      <AccentButton
        variant="filled"
        size="sm"
        className="mt-2 w-full font-label text-xs"
        disabled={!draft.trim() || submitting}
        onClick={() => void addNote()}
      >
        {submitting ? "Saving…" : "Add Note →"}
      </AccentButton>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
function ContactsManagerInner({ initialMessages, initialHires }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "hires" ? "hires" : "messages";

  const [messages, setMessages] = useState(initialMessages);
  const [hires, setHires] = useState(initialHires);
  const [selectedMsg, setSelectedMsg] = useState<DashboardContactMessage | null>(null);
  const [selectedHire, setSelectedHire] = useState<DashboardHireRequest | null>(null);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [replySubject, setReplySubject] = useState("Re: Your message to Yusuf Diallo");
  const [replyMessage, setReplyMessage] = useState("\n\n— Yusuf Diallo\nyusufdiallodev.com");
  const [sendingReply, setSendingReply] = useState(false);

  // Replied filter state per tab
  const [filterUnrepliedMsg, setFilterUnrepliedMsg] = useState(false);
  const [filterUnrepliedHire, setFilterUnrepliedHire] = useState(false);

  useEffect(() => { setMessages(initialMessages); }, [initialMessages]);
  useEffect(() => { setHires(initialHires); }, [initialHires]);

  const setTab = useCallback(
    (next: "messages" | "hires") => {
      router.replace(`/dashboard/contacts?tab=${next}`);
    },
    [router]
  );

  const openMessage = async (m: DashboardContactMessage) => {
    setSelectedMsg(m);
    setSelectedHire(null);
    if (!m.read) {
      const res = await fetch(`/api/dashboard/contact-messages/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      if (res.ok) {
        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
        router.refresh();
      }
    }
  };

  const markAllRead = async () => {
    const res = await fetch("/api/dashboard/contact-messages/mark-all-read", { method: "POST" });
    if (!res.ok) { toast.error("Could not mark all read"); return; }
    setMessages((prev) => prev.map((x) => ({ ...x, read: true })));
    toast.success("All marked read");
    router.refresh();
  };

  const updateHireStatus = async (id: string, status: (typeof HIRE_STATUSES)[number]) => {
    const res = await fetch(`/api/dashboard/hire-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { toast.error("Update failed"); return; }
    setHires((prev) => prev.map((h) => (h.id === id ? { ...h, status } : h)));
    setSelectedHire((h) => (h?.id === id ? { ...h, status } : h));
    router.refresh();
  };

  const openReply = (target: ReplyTarget) => {
    setReplyTarget(target);
    setReplySubject(target.subject);
    setReplyMessage("\n\n— Yusuf Diallo\nyusufdiallodev.com");
  };

  const sendReply = async () => {
    if (!replyTarget) return;
    setSendingReply(true);
    try {
      const res = await fetch("/api/dashboard/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: replyTarget.toEmail,
          toName: replyTarget.toName,
          subject: replySubject,
          message: replyMessage,
          recordType: replyTarget.recordType,
          recordId: replyTarget.recordId,
        }),
      });
      if (!res.ok) { toast.error("Could not send reply."); return; }
      toast.success("Reply sent.");
      if (replyTarget.recordType === "contact") {
        setMessages((prev) =>
          prev.map((x) => (x.id === replyTarget.recordId ? { ...x, replied: true } : x))
        );
      } else {
        setHires((prev) =>
          prev.map((x) => (x.id === replyTarget.recordId ? { ...x, replied: true } : x))
        );
      }
      setReplyTarget(null);
      router.refresh();
    } finally {
      setSendingReply(false);
    }
  };

  const visibleMessages = filterUnrepliedMsg ? messages.filter((m) => !m.replied) : messages;
  const visibleHires = filterUnrepliedHire ? hires.filter((h) => !h.replied) : hires;

  const unrepliedMsgCount = messages.filter((m) => !m.replied).length;
  const unrepliedHireCount = hires.filter((h) => !h.replied).length;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-4">
        {/* Tab bar + filter + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 rounded-lg border border-[var(--glass-border)] bg-black/40 p-1 font-label text-xs">
            <button
              type="button"
              onClick={() => setTab("messages")}
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors",
                tab === "messages" ? "bg-white/10 text-white" : "text-[var(--text-muted)] hover:text-white"
              )}
            >
              Messages
            </button>
            <button
              type="button"
              onClick={() => setTab("hires")}
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors",
                tab === "hires" ? "bg-white/10 text-white" : "text-[var(--text-muted)] hover:text-white"
              )}
            >
              Hire Requests
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Unreplied filter toggle */}
            {tab === "messages" && (
              <button
                type="button"
                onClick={() => setFilterUnrepliedMsg((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-label text-xs transition-colors",
                  filterUnrepliedMsg
                    ? "border-[var(--js)]/60 bg-[color-mix(in_srgb,var(--js)_14%,transparent)] text-[var(--js)]"
                    : "border-[var(--glass-border)] bg-white/[0.03] text-[var(--text-muted)] hover:text-white"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", filterUnrepliedMsg ? "bg-[var(--js)]" : "bg-[var(--text-muted)]")} />
                Unreplied{unrepliedMsgCount > 0 && ` (${unrepliedMsgCount})`}
              </button>
            )}
            {tab === "hires" && (
              <button
                type="button"
                onClick={() => setFilterUnrepliedHire((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-label text-xs transition-colors",
                  filterUnrepliedHire
                    ? "border-[var(--js)]/60 bg-[color-mix(in_srgb,var(--js)_14%,transparent)] text-[var(--js)]"
                    : "border-[var(--glass-border)] bg-white/[0.03] text-[var(--text-muted)] hover:text-white"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", filterUnrepliedHire ? "bg-[var(--js)]" : "bg-[var(--text-muted)]")} />
                Unreplied{unrepliedHireCount > 0 && ` (${unrepliedHireCount})`}
              </button>
            )}

            {tab === "messages" && (
              <AccentButton variant="ghost" className="font-label text-xs" type="button" onClick={() => void markAllRead()}>
                Mark All Read
              </AccentButton>
            )}
          </div>
        </div>

        {/* Messages table */}
        {tab === "messages" ? (
          <GlassCard disableHoverScale className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left font-label text-sm">
                <thead>
                  <tr className="border-b border-[var(--glass-border)] text-[10px] uppercase text-[var(--text-muted)]">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Preview</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleMessages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-muted)]">
                        {filterUnrepliedMsg ? "No unreplied messages" : "No messages"}
                      </td>
                    </tr>
                  ) : (
                    visibleMessages.map((m) => (
                      <tr
                        key={m.id}
                        className={cn(
                          "cursor-pointer border-b border-[var(--glass-border)]/40 hover:bg-white/[0.04]",
                          selectedMsg?.id === m.id && "bg-white/[0.06]"
                        )}
                        onClick={() => void openMessage(m)}
                      >
                        <td className="px-4 py-3 text-white">{m.name}</td>
                        <td className="max-w-[140px] truncate px-4 py-3 text-[var(--text-secondary)]">{m.email}</td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-[var(--text-muted)]">{m.message}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-[var(--text-muted)]">
                          {new Date(m.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase",
                            m.read ? "border-white/15 bg-white/5 text-[var(--text-secondary)]" : hireStatusClass("new")
                          )}>
                            {m.read ? "Read" : "Unread"}
                          </span>
                          {m.replied && (
                            <span className="ml-1 inline-flex rounded-full border border-[var(--go)]/40 bg-[color-mix(in_srgb,var(--go)_14%,transparent)] px-2 py-0.5 text-[10px] uppercase text-[var(--go)]">
                              Replied
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <AccentButton
                            variant="ghost"
                            size="sm"
                            className="font-label text-[11px]"
                            onClick={() => openReply({
                              recordType: "contact",
                              recordId: m.id,
                              toName: m.name,
                              toEmail: m.email,
                              subject: "Re: Your message to Yusuf Diallo",
                            })}
                          >
                            Reply
                          </AccentButton>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        ) : (
          /* Hire Requests table */
          <GlassCard disableHoverScale className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left font-label text-sm">
                <thead>
                  <tr className="border-b border-[var(--glass-border)] text-[10px] uppercase text-[var(--text-muted)]">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Budget</th>
                    <th className="px-4 py-3">Timeline</th>
                    <th className="px-4 py-3">Stack</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Reply</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleHires.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-[var(--text-muted)]">
                        {filterUnrepliedHire ? "No unreplied hire requests" : "No hire requests"}
                      </td>
                    </tr>
                  ) : (
                    visibleHires.map((h) => (
                      <tr
                        key={h.id}
                        className={cn(
                          "cursor-pointer border-b border-[var(--glass-border)]/40 hover:bg-white/[0.04]",
                          selectedHire?.id === h.id && "bg-white/[0.06]"
                        )}
                        onClick={() => { setSelectedHire(h); setSelectedMsg(null); }}
                      >
                        <td className="px-4 py-3 text-white">{h.name}</td>
                        <td className="max-w-[120px] truncate px-4 py-3 text-[var(--text-secondary)]">{h.email}</td>
                        <td className="px-4 py-3">
                          <TechBadge tech={h.project_type || "—"} size="sm" />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[var(--text-secondary)]">{h.budget}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-[var(--text-muted)]">{h.timeline}</td>
                        <td className="px-4 py-3">
                          <div className="flex max-w-[200px] flex-wrap gap-1">
                            {(h.tech_stack ?? []).slice(0, 5).map((t) => (
                              <TechBadge key={t} tech={t} size="sm" />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            className={cn(inputClass, hireStatusClass(h.status ?? "new"))}
                            value={h.status ?? "new"}
                            onChange={(e) => void updateHireStatus(h.id, e.target.value as (typeof HIRE_STATUSES)[number])}
                          >
                            {HIRE_STATUSES.map((s) => (
                              <option key={s} value={s} className="bg-black text-white">{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <AccentButton
                            variant="ghost"
                            size="sm"
                            className="font-label text-[11px]"
                            onClick={() => openReply({
                              recordType: "hire",
                              recordId: h.id,
                              toName: h.name,
                              toEmail: h.email,
                              subject: "Re: Your hire request to Yusuf Diallo",
                            })}
                          >
                            {h.replied ? "Replied" : "Reply"}
                          </AccentButton>
                        </td>
                        <td className="px-4 py-3">
                          {(h.notes_count ?? 0) > 0 ? (
                            <span className="inline-flex items-center rounded-full border border-[var(--react)]/40 bg-[color-mix(in_srgb,var(--react)_12%,transparent)] px-2 py-0.5 font-label text-[10px] text-[var(--react)]">
                              {h.notes_count}
                            </span>
                          ) : (
                            <span className="font-label text-[10px] text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[var(--text-muted)]">
                          {new Date(h.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Detail panel */}
      <GlassCard
        disableHoverScale
        className="w-full max-w-full shrink-0 border-[var(--glass-border)] lg:sticky lg:top-28 lg:max-w-[380px] lg:self-start"
      >
        {selectedMsg ? (
          <div className="p-5 font-label text-sm">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Message</p>
            <p className="mt-2 text-lg text-white">{selectedMsg.name}</p>
            <p className="text-[var(--react)]">{selectedMsg.email}</p>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-[var(--text-secondary)]">{selectedMsg.message}</p>
            <p className="mt-4 text-[10px] text-[var(--text-muted)]">{new Date(selectedMsg.created_at).toLocaleString()}</p>
            <div className="mt-4">
              <AccentButton
                variant="filled"
                size="sm"
                className="font-label text-xs"
                onClick={() => openReply({
                  recordType: "contact",
                  recordId: selectedMsg.id,
                  toName: selectedMsg.name,
                  toEmail: selectedMsg.email,
                  subject: "Re: Your message to Yusuf Diallo",
                })}
              >
                Reply →
              </AccentButton>
            </div>
          </div>
        ) : selectedHire ? (
          <div className="p-5 font-label text-sm">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Hire request</p>
            <p className="mt-2 text-lg text-white">{selectedHire.name}</p>
            <p className="text-[var(--react)]">{selectedHire.email}</p>
            <div className="mt-4 space-y-2 text-[var(--text-secondary)]">
              <p>
                <span className="text-[var(--text-muted)]">Type: </span>
                <TechBadge tech={selectedHire.project_type || "—"} size="sm" />
              </p>
              <p><span className="text-[var(--text-muted)]">Budget: </span>{selectedHire.budget}</p>
              <p><span className="text-[var(--text-muted)]">Timeline: </span>{selectedHire.timeline}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {(selectedHire.tech_stack ?? []).map((t) => (
                  <TechBadge key={t} tech={t} size="sm" />
                ))}
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-white">{selectedHire.description}</p>
            <p className="mt-4 text-[10px] text-[var(--text-muted)]">{new Date(selectedHire.created_at).toLocaleString()}</p>
            <div className="mt-3">
              <AccentButton
                variant="filled"
                size="sm"
                className="font-label text-xs"
                onClick={() => openReply({
                  recordType: "hire",
                  recordId: selectedHire.id,
                  toName: selectedHire.name,
                  toEmail: selectedHire.email,
                  subject: "Re: Your hire request to Yusuf Diallo",
                })}
              >
                Reply →
              </AccentButton>
            </div>
            {/* Client Notes */}
            <ClientNotesPanel hireId={selectedHire.id} />
          </div>
        ) : (
          <div className="p-8 text-center font-label text-sm text-[var(--text-muted)]">Select a row</div>
        )}
      </GlassCard>

      {/* Reply dialog */}
      <Dialog open={Boolean(replyTarget)} onOpenChange={(open) => !open && setReplyTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Reply</DialogTitle>
          </DialogHeader>
          {replyTarget ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-[var(--glass-border)] bg-black/50 px-3 py-2 font-label text-xs text-[var(--text-secondary)]">
                To: {replyTarget.toName} {"<"}{replyTarget.toEmail}{">"}
              </div>
              <label className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Subject
                <input
                  className={cn(inputClass, "mt-1")}
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                />
              </label>
              <label className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Message
                <textarea
                  className={cn(inputClass, "mt-1 min-h-[180px] resize-y")}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
              </label>
            </div>
          ) : null}
          <DialogFooter>
            <AccentButton variant="ghost" onClick={() => setReplyTarget(null)}>Cancel</AccentButton>
            <AccentButton variant="filled" disabled={sendingReply} onClick={() => void sendReply()}>
              Send Reply →
            </AccentButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ContactsManager(props: Props) {
  return (
    <Suspense fallback={<div className="font-label text-sm text-[var(--text-muted)]">Loading…</div>}>
      <ContactsManagerInner {...props} />
    </Suspense>
  );
}
