"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { GlassCard } from "@/components/ui/glass-card";
import { AccentButton } from "@/components/ui/accent-button";

const inputClass =
  "w-full rounded-lg border border-[var(--glass-border)] bg-black/65 px-3 py-2.5 font-mono text-sm text-white outline-none transition-[border-color] placeholder:text-[var(--text-muted)] focus:border-[var(--react)]";

export function Newsletter() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      });
      const json = await res.json() as { ok: boolean; duplicate?: boolean };
      if (!res.ok || !json.ok) {
        toast.error("Something went wrong. Please try again.");
        return;
      }
      if (json.duplicate) {
        toast.info("You're already subscribed!");
      } else {
        toast.success("You're in! Check your inbox.");
        setName("");
        setEmail("");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="newsletter"
      className="relative scroll-mt-32 border-b border-[var(--glass-border)]/40 bg-[#000000]"
    >
      <div className="mx-auto max-w-wide px-gutter py-section">
        <GlassCard className="overflow-hidden p-0" glow="var(--react)" disableHoverScale>
          <div className="grid gap-0 md:grid-cols-2">
            {/* Left */}
            <div className="flex flex-col justify-center gap-4 border-b border-[var(--glass-border)] p-8 md:border-b-0 md:border-r md:p-10">
              <p className="font-mono text-xs text-[var(--text-muted)]">{"// newsletter"}</p>
              <h2 className="font-display text-3xl font-normal tracking-[-0.02em] text-white md:text-4xl">
                Stay in the Loop
              </h2>
              <p className="font-mono text-sm leading-relaxed text-[var(--text-muted)]">
                New projects, dev tutorials, and builds — straight to your inbox. No spam.
              </p>
              <p className="font-mono text-xs text-[var(--text-secondary)]">
                Join 120+ developers
              </p>
            </div>

            {/* Right */}
            <div className="flex flex-col justify-center gap-4 p-8 md:p-10">
              <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Your name — optional"
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
                <AccentButton
                  type="submit"
                  variant="filled"
                  disabled={loading || !email.trim()}
                  className="w-full font-mono"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subscribing…
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </AccentButton>
                <p className="font-mono text-[11px] text-[var(--text-muted)]">
                  Powered by Resend · Unsubscribe anytime
                </p>
              </form>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
