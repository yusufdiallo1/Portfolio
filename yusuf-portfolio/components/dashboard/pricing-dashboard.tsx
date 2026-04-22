"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AccentButton } from "@/components/ui/accent-button";
import { cn } from "@/lib/utils";
import type { DashboardPricingRow } from "@/lib/dashboard-queries";

const CHECK_COLORS = ["var(--js)", "var(--react)", "var(--go)"] as const;

const inputClass =
  "w-full rounded-lg border border-[var(--glass-border)] bg-black/65 px-3 py-2.5 font-label text-sm text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--react)] focus:ring-1 focus:ring-[var(--react)]";

type Draft = {
  name: string;
  price: string;
  billing_period: string;
  description: string;
  featuresText: string;
  highlighted: boolean;
};

function toDraft(row: DashboardPricingRow): Draft {
  const features = Array.isArray(row.features) ? row.features.join("\n") : "";
  return {
    name: row.name,
    price: row.price,
    billing_period: row.billing_period || "project",
    description: row.description ?? "",
    featuresText: features,
    highlighted: Boolean(row.highlighted),
  };
}

function PlanCardPreview({
  name,
  price,
  billingPeriod,
  description,
  features,
  highlighted,
}: {
  name: string;
  price: string;
  billingPeriod: string;
  description: string;
  features: string[];
  highlighted: boolean;
}) {
  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl border transition-[transform,box-shadow] duration-300",
        highlighted
          ? "glass-strong z-[1] scale-[1.02] border-[var(--glass-border-hover)] md:-mt-2 md:mb-2"
          : "liquid-surface border-[var(--glass-border)]"
      )}
    >
      {highlighted && (
        <span className="absolute right-3 top-3 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wide text-[var(--js)] backdrop-blur-md">
          Most Popular
        </span>
      )}

      <div className={cn("flex flex-1 flex-col p-6", highlighted && "pt-12")}>
        <p className="font-label text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">{name.toUpperCase()}</p>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="font-display text-[48px] font-normal leading-none tracking-[-0.02em] text-white">{price}</span>
          <span className="font-mono text-sm text-[var(--text-muted)]">/{billingPeriod}</span>
        </div>
        <p className="mt-4 font-mono text-sm leading-relaxed text-[var(--text-muted)]">{description}</p>

        <div className="my-6 h-px w-full bg-[var(--glass-border)]" />

        <ul className="flex flex-1 flex-col gap-3">
          {features.map((f, i) => (
            <li key={`${f}-${i}`} className="flex gap-2 font-mono text-sm text-white">
              <span className="shrink-0 font-medium" style={{ color: CHECK_COLORS[i % CHECK_COLORS.length] }} aria-hidden>
                ✓
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <AccentButton type="button" variant={highlighted ? "filled" : "ghost"} className="w-full font-mono" disabled>
            Start a project
          </AccentButton>
        </div>
      </div>
    </article>
  );
}

export function PricingDashboard({ initialRows }: { initialRows: DashboardPricingRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const startEdit = (row: DashboardPricingRow) => {
    setEditingId(row.id);
    setDraft(toDraft(row));
  };

  const cancel = () => {
    setEditingId(null);
    setDraft(null);
  };

  const save = async () => {
    if (!editingId || !draft) return;
    const features = draft.featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/pricing/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name.trim(),
          price: draft.price.trim(),
          billing_period: draft.billing_period.trim(),
          description: draft.description.trim() || null,
          features,
          highlighted: draft.highlighted,
        }),
      });
      if (!res.ok) {
        toast.error("Save failed");
        return;
      }
      toast.success("Saved");
      cancel();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-stretch">
        {rows.map((row) => {
          const isEditing = editingId === row.id;
          const staticFeatures = (row.features ?? []).map(String);
          const liveFromDraft =
            isEditing && draft
              ? draft.featuresText
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : staticFeatures;

          return (
            <div key={row.id} className="flex flex-col gap-0">
              <PlanCardPreview
                name={isEditing && draft ? draft.name : row.name}
                price={isEditing && draft ? draft.price : row.price}
                billingPeriod={isEditing && draft ? draft.billing_period : row.billing_period || "project"}
                description={isEditing && draft ? draft.description : row.description ?? ""}
                features={liveFromDraft.length ? liveFromDraft : ["—"]}
                highlighted={isEditing && draft ? draft.highlighted : Boolean(row.highlighted)}
              />
              <div className="mt-3 flex justify-center">
                <AccentButton variant="ghost" className="font-label text-xs" type="button" onClick={() => startEdit(row)}>
                  Edit Plan
                </AccentButton>
              </div>

              {isEditing && draft && (
                <div className="glass-strong mt-4 rounded-xl border border-[var(--liquid-border)] p-4">
                  <div className="grid gap-3">
                    <label className="font-label text-[10px] uppercase text-[var(--text-muted)]">
                      Name
                      <input
                        className={cn(inputClass, "mt-1")}
                        value={draft.name}
                        onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                      />
                    </label>
                    <label className="font-label text-[10px] uppercase text-[var(--text-muted)]">
                      Price
                      <input
                        className={cn(inputClass, "mt-1")}
                        value={draft.price}
                        onChange={(e) => setDraft((d) => (d ? { ...d, price: e.target.value } : d))}
                      />
                    </label>
                    <label className="font-label text-[10px] uppercase text-[var(--text-muted)]">
                      Billing period
                      <input
                        className={cn(inputClass, "mt-1")}
                        value={draft.billing_period}
                        onChange={(e) => setDraft((d) => (d ? { ...d, billing_period: e.target.value } : d))}
                      />
                    </label>
                    <label className="font-label text-[10px] uppercase text-[var(--text-muted)]">
                      Description
                      <input
                        className={cn(inputClass, "mt-1")}
                        value={draft.description}
                        onChange={(e) => setDraft((d) => (d ? { ...d, description: e.target.value } : d))}
                      />
                    </label>
                    <label className="font-label text-[10px] uppercase text-[var(--text-muted)]">
                      Features (one per line)
                      <textarea
                        className={cn(inputClass, "mt-1 min-h-[120px] resize-y")}
                        value={draft.featuresText}
                        onChange={(e) => setDraft((d) => (d ? { ...d, featuresText: e.target.value } : d))}
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3 font-label text-sm text-[var(--text-secondary)]">
                      Highlighted
                      <button
                        type="button"
                        role="switch"
                        aria-checked={draft.highlighted}
                        onClick={() => setDraft((d) => (d ? { ...d, highlighted: !d.highlighted } : d))}
                        className={cn(
                          "relative h-6 w-11 shrink-0 rounded-full border border-[var(--glass-border)] transition-colors",
                          draft.highlighted ? "bg-[var(--react)]" : "bg-white/10"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                            draft.highlighted ? "translate-x-5" : "translate-x-0.5"
                          )}
                        />
                      </button>
                    </label>
                    <div className="flex flex-wrap justify-end gap-2 pt-2">
                      <AccentButton variant="ghost" type="button" onClick={cancel}>
                        Cancel
                      </AccentButton>
                      <AccentButton variant="filled" type="button" disabled={loading} onClick={() => void save()}>
                        Save Changes
                      </AccentButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
