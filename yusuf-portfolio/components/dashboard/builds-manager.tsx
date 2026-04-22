"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Build = {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  tech_stack: string[];
  status: "building" | "launching" | "shipped";
  emoji: string;
  sort_order: number;
  visible: boolean;
};

type FormState = {
  title: string;
  description: string;
  emoji: string;
  progress: number;
  tech_stack: string;
  status: "building" | "launching" | "shipped";
  visible: boolean;
};

const empty: FormState = {
  title: "",
  description: "",
  emoji: "🔨",
  progress: 0,
  tech_stack: "",
  status: "building",
  visible: true,
};

const inputClass =
  "w-full rounded-lg border border-[var(--glass-border)] bg-black/65 px-3 py-2.5 font-label text-sm text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--react)] focus:ring-1 focus:ring-[var(--react)]";

const STATUS_COLORS: Record<string, string> = {
  building: "var(--js)",
  launching: "var(--go)",
  shipped: "#34c759",
};

const STATUS_LABELS: Record<string, string> = {
  building: "Building 🔨",
  launching: "Launching 🚀",
  shipped: "Shipped ✓",
};

export function BuildsManager({ initialBuilds }: { initialBuilds: Build[] }) {
  const router = useRouter();
  const [builds, setBuilds] = useState(initialBuilds);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [deleteTarget, setDeleteTarget] = useState<Build | null>(null);
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(empty);
    setModalOpen(true);
  };

  const openEdit = (b: Build) => {
    setEditingId(b.id);
    setForm({
      title: b.title,
      description: b.description ?? "",
      emoji: b.emoji,
      progress: b.progress,
      tech_stack: (b.tech_stack ?? []).join(", "),
      status: b.status,
      visible: b.visible,
    });
    setModalOpen(true);
  };

  const parseTechStack = (s: string) =>
    s.split(",").map((x) => x.trim()).filter(Boolean);

  const submit = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        emoji: form.emoji || "🔨",
        progress: Math.min(100, Math.max(0, form.progress)),
        tech_stack: parseTechStack(form.tech_stack),
        status: form.status,
        visible: form.visible,
      };

      if (editingId) {
        const res = await fetch(`/api/dashboard/builds/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { toast.error("Could not update build"); return; }
        toast.success("Build updated");
      } else {
        const res = await fetch("/api/dashboard/builds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { toast.error("Could not create build"); return; }
        toast.success("Build created");
      }
      setModalOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/builds/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Could not delete"); return; }
      setBuilds((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      toast.success("Deleted");
      setDeleteTarget(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisible = async (b: Build, visible: boolean) => {
    const res = await fetch(`/api/dashboard/builds/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible }),
    });
    if (!res.ok) { toast.error("Update failed"); return; }
    setBuilds((prev) => prev.map((x) => (x.id === b.id ? { ...x, visible } : x)));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AccentButton variant="filled" type="button" className="font-label text-xs" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" />
          Add Build
        </AccentButton>
      </div>

      <GlassCard disableHoverScale className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left font-label text-sm">
            <thead>
              <tr className="border-b border-[var(--glass-border)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-4 py-3">Build</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Visible</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {builds.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[var(--text-muted)]">
                    No builds yet
                  </td>
                </tr>
              ) : (
                builds.map((b) => (
                  <tr key={b.id} className="border-b border-[var(--glass-border)]/50">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{b.emoji}</span>
                        <span className="font-medium text-white">{b.title}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-[var(--react)]"
                            style={{ width: `${b.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-[var(--text-muted)]">{b.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px]"
                        style={{
                          color: STATUS_COLORS[b.status],
                          background: `color-mix(in srgb, ${STATUS_COLORS[b.status]} 15%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${STATUS_COLORS[b.status]} 35%, transparent)`,
                        }}
                      >
                        {STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={b.visible}
                        onCheckedChange={(v) => void toggleVisible(b, v)}
                        aria-label="Visible"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(b)}
                          className="rounded p-2 text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--react)]"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(b)}
                          className="rounded p-2 text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--rust)]"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Create / Edit modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[min(90vh,680px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingId ? "Edit Build" : "Add Build"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 pt-2">
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <label className="font-label text-[11px] uppercase text-[var(--text-muted)]">
                Emoji
                <input
                  className={cn(inputClass, "mt-1 text-center text-2xl")}
                  value={form.emoji}
                  onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                  maxLength={4}
                />
              </label>
              <label className="font-label text-[11px] uppercase text-[var(--text-muted)]">
                Title *
                <input
                  className={cn(inputClass, "mt-1")}
                  placeholder="Portfolio v2"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </label>
            </div>
            <label className="font-label text-[11px] uppercase text-[var(--text-muted)]">
              Description
              <textarea
                className={cn(inputClass, "mt-1 min-h-[80px] resize-y")}
                placeholder="What are you building?"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>
            <label className="font-label text-[11px] uppercase text-[var(--text-muted)]">
              Tech Stack (comma-separated)
              <input
                className={cn(inputClass, "mt-1")}
                placeholder="Next.js, Supabase, Tailwind"
                value={form.tech_stack}
                onChange={(e) => setForm((f) => ({ ...f, tech_stack: e.target.value }))}
              />
            </label>
            <label className="font-label text-[11px] uppercase text-[var(--text-muted)]">
              Progress: {form.progress}%
              <input
                type="range"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) => setForm((f) => ({ ...f, progress: Number(e.target.value) }))}
                className="mt-2 w-full accent-[var(--react)]"
              />
            </label>
            <label className="font-label text-[11px] uppercase text-[var(--text-muted)]">
              Status
              <select
                className={cn(inputClass, "mt-1")}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as FormState["status"] }))}
              >
                <option value="building">Building 🔨</option>
                <option value="launching">Launching 🚀</option>
                <option value="shipped">Shipped ✓</option>
              </select>
            </label>
            <label className="flex items-center justify-between gap-3 font-label text-sm text-[var(--text-secondary)]">
              Visible on portfolio
              <Switch
                checked={form.visible}
                onCheckedChange={(v) => setForm((f) => ({ ...f, visible: v }))}
              />
            </label>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <AccentButton variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </AccentButton>
            <AccentButton
              variant="filled"
              type="button"
              disabled={loading}
              onClick={() => void submit()}
            >
              {editingId ? "Save" : "Create"}
            </AccentButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Delete build?</DialogTitle>
          </DialogHeader>
          <p className="font-label text-sm text-[var(--text-secondary)]">
            &ldquo;{deleteTarget?.title}&rdquo; will be permanently removed.
          </p>
          <DialogFooter>
            <AccentButton variant="ghost" type="button" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AccentButton>
            <AccentButton
              variant="filled"
              className="!bg-[var(--rust)] hover:!text-white"
              type="button"
              disabled={loading}
              onClick={() => void remove()}
            >
              Delete
            </AccentButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
