"use client";

import { Check, Star, Trash2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccentButton } from "@/components/ui/accent-button";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import type { DashboardTestimonial } from "@/lib/dashboard-queries";

const inputClass =
  "w-full rounded-lg border border-[var(--glass-border)] bg-black/65 px-3 py-2.5 font-label text-sm text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--react)] focus:ring-1 focus:ring-[var(--react)]";

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("h-4 w-4", i < value ? "fill-[var(--js)] text-[var(--js)]" : "text-white/15")}
        />
      ))}
    </span>
  );
}

export function TestimonialsManager({ initialRows }: { initialRows: DashboardTestimonial[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    author_name: "",
    author_role: "",
    author_avatar: "",
    content: "",
    rating: 5,
  });

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const pending = useMemo(() => rows.filter((r) => r.approved !== true), [rows]);
  const approved = useMemo(() => rows.filter((r) => r.approved === true), [rows]);
  const list = tab === "pending" ? pending : approved;

  const counts = { pending: pending.length, approved: approved.length };

  const patchApproved = async (id: string, approvedFlag: boolean) => {
    const res = await fetch(`/api/dashboard/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: approvedFlag }),
    });
    if (!res.ok) {
      toast.error("Update failed");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, approved: approvedFlag } : r)));
    toast.success(approvedFlag ? "Approved" : "Moved to pending");
    router.refresh();
  };

  const remove = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/testimonials/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Delete failed");
        return;
      }
      toast.success("Deleted");
      setDeleteId(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const submitAdd = async () => {
    if (!form.author_name.trim() || !form.content.trim()) {
      toast.error("Name and content are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: form.author_name.trim(),
          author_role: form.author_role.trim() || null,
          author_avatar: form.author_avatar.trim() || null,
          content: form.content.trim(),
          rating: form.rating,
          approved: true,
        }),
      });
      if (!res.ok) {
        toast.error("Could not add");
        return;
      }
      toast.success("Testimonial added");
      setAddOpen(false);
      setForm({ author_name: "", author_role: "", author_avatar: "", content: "", rating: 5 });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 rounded-lg border border-[var(--glass-border)] bg-black/40 p-1 font-label text-xs">
          <button
            type="button"
            onClick={() => setTab("pending")}
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              tab === "pending" ? "bg-white/10 text-white" : "text-[var(--text-muted)] hover:text-white"
            )}
          >
            Pending ({counts.pending})
          </button>
          <button
            type="button"
            onClick={() => setTab("approved")}
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              tab === "approved" ? "bg-white/10 text-white" : "text-[var(--text-muted)] hover:text-white"
            )}
          >
            Approved ({counts.approved})
          </button>
        </div>
        <AccentButton variant="filled" className="font-label text-xs" type="button" onClick={() => setAddOpen(true)}>
          Add Testimonial
        </AccentButton>
      </div>

      <GlassCard disableHoverScale className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left font-label text-sm">
            <thead>
              <tr className="border-b border-[var(--glass-border)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Content</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--text-muted)]">
                    No testimonials
                  </td>
                </tr>
              ) : (
                list.map((r) => {
                  const snippet =
                    r.content.length > 80 ? `${r.content.slice(0, 80)}…` : r.content;
                  const rt = typeof r.rating === "number" ? r.rating : 5;
                  return (
                    <tr key={r.id} className="border-b border-[var(--glass-border)]/50">
                      <td className="px-4 py-3 text-white">{r.author_name}</td>
                      <td className="max-w-[120px] truncate px-4 py-3 text-[var(--text-secondary)]">{r.author_role}</td>
                      <td className="max-w-[280px] px-4 py-3 text-[var(--text-secondary)]">{snippet}</td>
                      <td className="px-4 py-3">
                        <Stars value={rt} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[var(--text-muted)]">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {tab === "pending" ? (
                            <>
                              <button
                                type="button"
                                className="rounded p-2 text-[var(--go)] hover:bg-white/10"
                                aria-label="Approve"
                                onClick={() => void patchApproved(r.id, true)}
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="rounded p-2 text-[var(--rust)] hover:bg-white/10"
                                aria-label="Delete"
                                onClick={() => setDeleteId(r.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="rounded p-2 text-[var(--js)] hover:bg-white/10"
                                aria-label="Unapprove"
                                onClick={() => void patchApproved(r.id, false)}
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="rounded p-2 text-[var(--rust)] hover:bg-white/10"
                                aria-label="Delete"
                                onClick={() => setDeleteId(r.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Add testimonial</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <label className="font-label text-[10px] uppercase text-[var(--text-muted)]">
              Author name *
              <input
                className={cn(inputClass, "mt-1")}
                value={form.author_name}
                onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
              />
            </label>
            <label className="font-label text-[10px] uppercase text-[var(--text-muted)]">
              Author role
              <input
                className={cn(inputClass, "mt-1")}
                value={form.author_role}
                onChange={(e) => setForm((f) => ({ ...f, author_role: e.target.value }))}
              />
            </label>
            <label className="font-label text-[10px] uppercase text-[var(--text-muted)]">
              Avatar URL
              <input
                className={cn(inputClass, "mt-1")}
                value={form.author_avatar}
                onChange={(e) => setForm((f) => ({ ...f, author_avatar: e.target.value }))}
              />
            </label>
            <label className="font-label text-[10px] uppercase text-[var(--text-muted)]">
              Content *
              <textarea
                className={cn(inputClass, "mt-1 min-h-[100px]")}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
            </label>
            <div>
              <p className="font-label text-[10px] uppercase text-[var(--text-muted)]">Rating</p>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, rating: n }))}
                    className="rounded p-1 text-[var(--js)] hover:bg-white/10"
                    aria-label={`${n} stars`}
                  >
                    <Star className={cn("h-6 w-6", n <= form.rating ? "fill-current" : "text-white/20")} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <AccentButton variant="ghost" type="button" onClick={() => setAddOpen(false)}>
              Cancel
            </AccentButton>
            <AccentButton variant="filled" type="button" disabled={loading} onClick={() => void submitAdd()}>
              Submit
            </AccentButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteId)} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Delete testimonial?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <AccentButton variant="ghost" type="button" onClick={() => setDeleteId(null)}>
              Cancel
            </AccentButton>
            <AccentButton variant="filled" className="!bg-[var(--rust)]" type="button" disabled={loading} onClick={() => void remove()}>
              Delete
            </AccentButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
