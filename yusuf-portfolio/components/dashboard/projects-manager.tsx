"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { TechBadge } from "@/components/ui/tech-badge";
import type { DashboardProject } from "@/lib/dashboard-queries";
import { getTechColor } from "@/lib/tech-colors";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-[var(--glass-border)] bg-black/65 px-3 py-2.5 font-label text-sm text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--react)] focus:ring-1 focus:ring-[var(--react)]";

type FormState = {
  title: string;
  description: string;
  url: string;
  image_url: string;
  tags: string;
  featured: boolean;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  url: "",
  image_url: "",
  tags: "",
  featured: false,
};

function parseTags(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function SortRow({
  project,
  onOpenEdit,
}: {
  project: DashboardProject;
  onOpenEdit: (p: DashboardProject) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-[var(--glass-border)] bg-black/40 px-3 py-2 font-label text-sm",
        isDragging && "opacity-60"
      )}
    >
      <button
        type="button"
        className="touch-none text-[var(--text-muted)] hover:text-white"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="min-w-0 flex-1 truncate text-white">{project.title}</span>
      <span className="text-[10px] text-[var(--text-muted)]">#{project.sort_order ?? "—"}</span>
      <button
        type="button"
        onClick={() => onOpenEdit(project)}
        className="rounded p-1.5 text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--react)]"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ProjectsManager({ initialProjects }: { initialProjects: DashboardProject[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<DashboardProject | null>(null);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ordered = useMemo(() => [...projects].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)), [projects]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: DashboardProject) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description ?? "",
      url: p.url,
      image_url: p.image_url ?? "",
      tags: (p.tags ?? []).join(", "),
      featured: Boolean(p.featured),
    });
    setModalOpen(true);
  };

  const submit = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      toast.error("Title and URL are required");
      return;
    }
    setLoading(true);
    try {
      const tags = parseTags(form.tags);
      if (editingId) {
        const res = await fetch(`/api/dashboard/projects/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim() || null,
            url: form.url.trim(),
            image_url: form.image_url.trim() || null,
            tags,
            featured: form.featured,
          }),
        });
        if (!res.ok) {
          toast.error("Could not update project");
          return;
        }
        toast.success("Project updated");
      } else {
        const res = await fetch("/api/dashboard/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim() || null,
            url: form.url.trim(),
            image_url: form.image_url.trim() || null,
            tags,
            featured: form.featured,
          }),
        });
        if (!res.ok) {
          toast.error("Could not create project");
          return;
        }
        toast.success("Project created");
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
      const res = await fetch(`/api/dashboard/projects/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Could not delete");
        return;
      }
      toast.success("Deleted");
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (p: DashboardProject, featured: boolean) => {
    const res = await fetch(`/api/dashboard/projects/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured }),
    });
    if (!res.ok) {
      toast.error("Update failed");
      return;
    }
    setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, featured } : x)));
    router.refresh();
  };

  const onDragEnd = useCallback(
    async (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      const oldIndex = ordered.findIndex((p) => p.id === active.id);
      const newIndex = ordered.findIndex((p) => p.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;
      const next = arrayMove(ordered, oldIndex, newIndex);
      setProjects(next);
      const orderedIds = next.map((p) => p.id);
      const res = await fetch("/api/dashboard/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) {
        toast.error("Reorder failed");
        router.refresh();
        return;
      }
      toast.success("Order saved");
      router.refresh();
    },
    [ordered, router]
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <AccentButton variant="filled" className="font-label text-xs" type="button" onClick={openCreate}>
          Add Project
        </AccentButton>
      </div>

      <GlassCard disableHoverScale className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left font-label text-sm">
            <thead>
              <tr className="border-b border-[var(--glass-border)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-4 py-3">Thumb</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--text-muted)]">
                    No projects yet
                  </td>
                </tr>
              ) : (
                ordered.map((p) => {
                  const tags = (p.tags ?? []).slice(0, 3);
                  const accent = tags[0] ? getTechColor(tags[0]) : "var(--text-muted)";
                  return (
                    <tr key={p.id} className="border-b border-[var(--glass-border)]/50">
                      <td className="px-4 py-3">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image_url}
                            alt=""
                            className="h-10 w-10 rounded-md border border-[var(--glass-border)] object-cover"
                            onError={(ev) => {
                              ev.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="h-10 w-10 rounded-md border border-[var(--glass-border)]"
                            style={{ background: `color-mix(in srgb, ${accent} 35%, #111)` }}
                          />
                        )}
                      </td>
                      <td className="max-w-[200px] px-4 py-3 font-medium text-white">{p.title}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {tags.map((t) => (
                            <TechBadge key={t} tech={t} size="sm" />
                          ))}
                        </div>
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-[var(--text-secondary)]">{p.url}</td>
                      <td className="px-4 py-3">
                        <Switch
                          checked={Boolean(p.featured)}
                          onCheckedChange={(v) => void toggleFeatured(p, v)}
                          aria-label="Featured"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="rounded p-2 text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--react)]"
                            aria-label="Edit"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded p-2 text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--rust)]"
                            aria-label="Delete"
                            onClick={() => setDeleteTarget(p)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      <div>
        <p className="mb-3 font-label text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
          Drag to set display order
        </p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void onDragEnd(e)}>
          <SortableContext items={ordered.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="flex max-w-xl flex-col gap-2">
              {ordered.map((p) => (
                <SortRow key={p.id} project={p} onOpenEdit={openEdit} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingId ? "Edit project" : "Add project"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 pt-2">
            <label className="font-label text-[11px] uppercase text-[var(--text-muted)]">
              Title *
              <input
                className={cn(inputClass, "mt-1")}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>
            <label className="font-label text-[11px] uppercase text-[var(--text-muted)]">
              Description
              <textarea
                className={cn(inputClass, "mt-1 min-h-[88px] resize-y")}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>
            <label className="font-label text-[11px] uppercase text-[var(--text-muted)]">
              URL *
              <input
                className={cn(inputClass, "mt-1")}
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              />
            </label>
            <label className="font-label text-[11px] uppercase text-[var(--text-muted)]">
              Image URL
              <input
                className={cn(inputClass, "mt-1")}
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              />
            </label>
            <label className="font-label text-[11px] uppercase text-[var(--text-muted)]">
              Tags (comma-separated)
              <input
                className={cn(inputClass, "mt-1")}
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              />
            </label>
            <label className="flex items-center justify-between gap-3 font-label text-sm text-[var(--text-secondary)]">
              Featured
              <Switch checked={form.featured} onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))} />
            </label>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <AccentButton variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </AccentButton>
            <AccentButton variant="filled" type="button" disabled={loading} onClick={() => void submit()}>
              {editingId ? "Save" : "Create"}
            </AccentButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Delete project?</DialogTitle>
          </DialogHeader>
          <p className="font-label text-sm text-[var(--text-secondary)]">This cannot be undone.</p>
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
