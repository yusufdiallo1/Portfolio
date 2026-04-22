"use client";

import { useState } from "react";
import { toast } from "sonner";

import { AccentButton } from "@/components/ui/accent-button";
import { GlassCard } from "@/components/ui/glass-card";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-[var(--glass-border)] bg-black/65 px-3 py-2.5 font-label text-sm text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--react)] focus:ring-1 focus:ring-[var(--react)]";

export function ReferralForm() {
  const [referrerName, setReferrerName] = useState("");
  const [referrerEmail, setReferrerEmail] = useState("");
  const [referredName, setReferredName] = useState("");
  const [referredEmail, setReferredEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrerName: referrerName.trim(),
          referrerEmail: referrerEmail.trim(),
          referredName: referredName.trim(),
          referredEmail: referredEmail.trim(),
          message: message.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Something went wrong");
        return;
      }
      void track("referral_submit", { path: "/refer" });
      toast.success("Referral sent! I'll reach out to them.");
      setReferrerName("");
      setReferrerEmail("");
      setReferredName("");
      setReferredEmail("");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard disableHoverScale className="p-6 md:p-8">
      <form onSubmit={(e) => void submit(e)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Your name *
            <input
              required
              className={cn(inputClass, "mt-1")}
              value={referrerName}
              onChange={(e) => setReferrerName(e.target.value)}
              autoComplete="name"
            />
          </label>
          <label className="block font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Your email *
            <input
              required
              type="email"
              className={cn(inputClass, "mt-1")}
              value={referrerEmail}
              onChange={(e) => setReferrerEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="block font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Friend&apos;s name *
            <input
              required
              className={cn(inputClass, "mt-1")}
              value={referredName}
              onChange={(e) => setReferredName(e.target.value)}
              autoComplete="name"
            />
          </label>
          <label className="block font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Friend&apos;s email *
            <input
              required
              type="email"
              className={cn(inputClass, "mt-1")}
              value={referredEmail}
              onChange={(e) => setReferredEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
        </div>
        <label className="block font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          Message (optional)
          <textarea
            className={cn(inputClass, "mt-1 min-h-[100px] resize-y")}
            placeholder="Tell me a bit about their project"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <AccentButton variant="filled" type="submit" className="w-full font-label md:w-auto" disabled={loading}>
          Send Referral →
        </AccentButton>
      </form>
    </GlassCard>
  );
}
