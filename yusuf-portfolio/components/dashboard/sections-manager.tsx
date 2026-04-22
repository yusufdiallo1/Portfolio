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
import { Eye, EyeOff, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { GlassCard } from "@/components/ui/glass-card";
import type { DashboardPageSection } from "@/lib/dashboard-queries";
import { cn } from "@/lib/utils";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About",
  skills: "Skills",
  projects: "Projects",
  pricing: "Pricing",
  hire: "Hire",
  faq: "FAQ",
  testimonials: "Testimonials",
};

const inputClass =
  "w-full rounded-lg border border-[var(--glass-border)] bg-black/65 px-3 py-2 font-label text-sm text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--react)] focus:ring-1 focus:ring-[var(--react)]";

function SortRow({
  section,
  onVisibleChange,
  onTitleInput,
  onTitleCommit,
}: {
  section: DashboardPageSection;
  onVisibleChange: (id: string, visible: boolean) => void;
  onTitleInput: (id: string, customTitle: string) => void;
  onTitleCommit: (id: string, customTitle: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const label = SECTION_LABELS[section.section_key] ?? section.section_key;
  const visible = section.visible !== false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-[var(--glass-border)] bg-black/40 px-3 py-3 font-label text-sm",
        isDragging && "opacity-60"
      )}
    >
      <span className="w-6 text-center text-[10px] text-[var(--text-muted)]">{section.sort_order ?? "—"}</span>
      <button
        type="button"
        className="touch-none text-[var(--text-muted)] hover:text-white"
        aria-label="Drag"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="min-w-[100px] font-mono text-xs text-white">{label}</div>
      <input
        className={cn(inputClass, "max-w-[220px] flex-1")}
        placeholder="Custom title (optional)"
        value={section.custom_title ?? ""}
        onChange={(e) => onTitleInput(section.id, e.target.value)}
        onBlur={(e) => onTitleCommit(section.id, e.target.value)}
      />
      <button
        type="button"
        onClick={() => onVisibleChange(section.id, !visible)}
        className={cn(
          "ml-auto rounded-lg border border-[var(--glass-border)] p-2 transition-colors",
          visible ? "text-[var(--go)] hover:bg-white/10" : "text-[var(--text-muted)] hover:bg-white/10"
        )}
        aria-label={visible ? "Hide section" : "Show section"}
      >
        {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function SectionsManager({ initialSections }: { initialSections: DashboardPageSection[] }) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const ordered = useMemo(
    () => [...sections].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [sections]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const updateTitle = useCallback(async (id: string, custom_title: string) => {
    const res = await fetch(`/api/dashboard/sections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ custom_title: custom_title.trim() || null }),
    });
    if (!res.ok) {
      toast.error("Could not save title");
      router.refresh();
      return;
    }
  }, [router]);

  const toggleVisible = async (id: string, visible: boolean) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible } : s)));
    const res = await fetch(`/api/dashboard/sections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible }),
    });
    if (!res.ok) {
      toast.error("Could not update");
      router.refresh();
      return;
    }
    toast.success(visible ? "Section visible" : "Section hidden");
    router.refresh();
  };

  const onTitleInput = useCallback((id: string, value: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, custom_title: value } : s)));
  }, []);

  const onTitleCommit = useCallback(
    (id: string, value: string) => {
      void updateTitle(id, value);
    },
    [updateTitle]
  );

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((s) => s.id === active.id);
    const newIndex = ordered.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(ordered, oldIndex, newIndex).map((s, i) => ({ ...s, sort_order: i }));
    setSections(next);
    const res = await fetch("/api/dashboard/sections/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: next.map((s) => s.id) }),
    });
    if (!res.ok) {
      toast.error("Reorder failed");
      router.refresh();
      return;
    }
    toast.success("Order saved");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-white">Page Sections</h2>
          <p className="mt-1 max-w-xl font-label text-sm text-[var(--text-muted)]">
            Drag to reorder. Toggle to show/hide. Changes reflect on the live site.
          </p>
        </div>
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 font-label text-xs text-[var(--text-primary)] backdrop-blur-md transition-colors hover:border-[var(--glass-border-hover)] hover:bg-[var(--glass-bg-hover)]"
        >
          Preview site →
        </a>
      </div>

      <GlassCard disableHoverScale className="p-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(ev) => void onDragEnd(ev)}>
          <SortableContext items={ordered.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {ordered.map((s) => (
                <SortRow
                  key={s.id}
                  section={s}
                  onVisibleChange={toggleVisible}
                  onTitleInput={onTitleInput}
                  onTitleCommit={onTitleCommit}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </GlassCard>
    </div>
  );
}
