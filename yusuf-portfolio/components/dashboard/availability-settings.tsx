"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AccentButton } from "@/components/ui/accent-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Switch } from "@/components/ui/switch";
import type { AvailabilityStatus } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-[var(--glass-border)] bg-black/65 px-3 py-2.5 font-label text-sm text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--react)] focus:ring-1 focus:ring-[var(--react)]";

const STATUSES: { id: AvailabilityStatus; label: string }[] = [
  { id: "available", label: "Available" },
  { id: "busy", label: "Busy" },
  { id: "unavailable", label: "Unavailable" },
];

type Form = {
  availabilityVisible: boolean;
  availabilityStatus: AvailabilityStatus;
  availabilityMessage: string;
  calendlyUrl: string;
};

export function AvailabilitySettings({ initial }: { initial: Form }) {
  const router = useRouter();
  const [form, setForm] = useState<Form>(initial);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/site-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availability_visible: form.availabilityVisible,
          availability_status: form.availabilityStatus,
          availability_message: form.availabilityMessage,
          calendly_url: form.calendlyUrl,
        }),
      });
      if (!res.ok) {
        toast.error("Could not save settings");
        return;
      }
      toast.success("Saved — live site updated");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard disableHoverScale className="p-6">
      <h2 className="font-display text-lg text-white">Availability</h2>
      <p className="mt-1 font-label text-xs text-[var(--text-muted)]">
        Controls the top banner and floating “Book a Call” button on the public site. No cache — changes show on the next page load.
      </p>

      <div className="mt-6 space-y-5">
        <label className="flex items-center justify-between gap-4 font-label text-sm text-[var(--text-secondary)]">
          Show availability banner
          <Switch
            checked={form.availabilityVisible}
            onCheckedChange={(v) => setForm((f) => ({ ...f, availabilityVisible: v }))}
            aria-label="Show banner"
          />
        </label>

        <div>
          <p className="mb-2 font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, availabilityStatus: s.id }))}
                className={cn(
                  "rounded-lg border px-3 py-2 font-label text-xs transition-colors",
                  form.availabilityStatus === s.id
                    ? "border-[var(--react)] bg-white/[0.08] text-white"
                    : "border-[var(--glass-border)] bg-black/40 text-[var(--text-muted)] hover:border-[var(--glass-border-hover)] hover:text-white"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block font-label text-[10px] uppercase text-[var(--text-muted)]">
          Availability message (shown when status is Available)
          <textarea
            className={cn(inputClass, "mt-1 min-h-[72px] resize-y")}
            value={form.availabilityMessage}
            onChange={(e) => setForm((f) => ({ ...f, availabilityMessage: e.target.value }))}
          />
        </label>

        <label className="block font-label text-[10px] uppercase text-[var(--text-muted)]">
          Calendly URL
          <input
            type="url"
            className={cn(inputClass, "mt-1")}
            value={form.calendlyUrl}
            onChange={(e) => setForm((f) => ({ ...f, calendlyUrl: e.target.value }))}
            placeholder="https://calendly.com/your-link"
          />
        </label>

        <AccentButton variant="filled" type="button" className="font-label text-xs" disabled={loading} onClick={() => void save()}>
          Save
        </AccentButton>
      </div>
    </GlassCard>
  );
}
