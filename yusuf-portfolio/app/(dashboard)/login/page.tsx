"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import Link from "next/link";

import { CodeRain } from "@/components/dashboard/code-rain";
import { AccentButton } from "@/components/ui/accent-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Eye, EyeOff } from "lucide-react";

const MAX_ATTEMPTS = 3;
const LOCK_MS = 60_000;

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"id" | "password">("id");
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!lockUntil) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [lockUntil]);

  const locked = lockUntil !== null && now < lockUntil;
  const lockRemainingSec = lockUntil
    ? Math.max(0, Math.ceil((lockUntil - now) / 1000))
    : 0;

  useEffect(() => {
    if (lockUntil && now >= lockUntil) {
      setLockUntil(null);
      setFailedAttempts(0);
    }
  }, [lockUntil, now]);

  const submitId = useCallback(async () => {
    const id = adminId.trim();
    if (!id) {
      toast.error("Enter your Admin ID");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "id", adminId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Request failed");
        return;
      }
      if (data.step === "password") {
        setStep("password");
      }
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  const submitPassword = useCallback(async () => {
    if (locked) return;
    if (!password) {
      toast.error("Enter your password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "password",
          adminId: adminId.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFailedAttempts((prev) => {
          const next = prev + 1;
          if (next >= MAX_ATTEMPTS) {
            setLockUntil(Date.now() + LOCK_MS);
            toast.error("Too many attempts. Locked for 60 seconds.");
          } else {
            toast.error(typeof data.error === "string" ? data.error : "Invalid password");
          }
          return next;
        });
        return;
      }
      setFailedAttempts(0);
      toast.success("Signed in");
      router.refresh();
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [adminId, password, locked, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-12">
      <CodeRain />

      {/* Logo — back to portfolio */}
      <Link
        href="/"
        className="absolute left-1/2 top-8 z-10 -translate-x-1/2 flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-white/[0.04] px-4 py-2 backdrop-blur-md transition-[border-color,background] hover:border-[var(--glass-border-hover)] hover:bg-white/[0.07]"
        aria-label="Back to portfolio"
      >
        <span className="font-display text-lg font-normal tracking-[-0.02em] text-white">YD</span>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">← portfolio</span>
      </Link>

      <GlassCard className="relative z-10 w-full max-w-[400px] overflow-hidden p-8">
        <AnimatePresence mode="wait">
          {step === "id" ? (
            <motion.div
              key="id"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <header className="space-y-2">
                <h1 className="font-display text-3xl text-[var(--text-primary)]">Dashboard Access</h1>
                <p className="text-sm text-[var(--text-secondary)]">Sign in with your Admin ID</p>
              </header>
              <div className="space-y-2">
                <label htmlFor="login-admin-id" className="text-xs text-[var(--text-secondary)]">
                  Admin ID
                </label>
                <input
                  id="login-admin-id"
                  autoComplete="username"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void submitId()}
                  className="w-full rounded-lg border border-[var(--glass-border)] bg-black/40 px-3 py-3 font-mono text-lg text-[var(--text-primary)] outline-none ring-white/10 placeholder:text-[var(--text-muted)] focus:border-[var(--glass-border-hover)] focus:ring-2 focus:ring-white/20"
                  placeholder="your-id"
                />
              </div>
              <AccentButton
                type="button"
                variant="filled"
                className="w-full"
                disabled={loading}
                onClick={() => void submitId()}
              >
                {loading ? "…" : "Continue →"}
              </AccentButton>
            </motion.div>
          ) : (
            <motion.div
              key="pwd"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <header className="space-y-1">
                <p className="font-mono text-xs text-[var(--text-secondary)]">
                  Welcome back, <span className="text-[var(--text-primary)]">{adminId.trim()}</span>
                </p>
                <h2 className="font-display text-2xl text-[var(--text-primary)]">Password</h2>
              </header>
              <div className="space-y-2">
                <label htmlFor="login-password" className="text-xs text-[var(--text-secondary)]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !locked && void submitPassword()}
                    disabled={locked}
                    className="w-full rounded-lg border border-[var(--glass-border)] bg-black/40 px-3 py-2.5 pr-10 font-mono text-sm text-[var(--text-primary)] outline-none ring-white/10 placeholder:text-[var(--text-muted)] focus:border-[var(--glass-border-hover)] focus:ring-2 focus:ring-white/20 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
                    onClick={() => setShowPw((s) => !s)}
                    disabled={locked}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              {locked && (
                <p className="text-center font-mono text-sm text-[var(--rust)]">
                  Locked — try again in {lockRemainingSec}s
                </p>
              )}
              <AccentButton
                type="button"
                variant="filled"
                className="w-full"
                disabled={loading || locked}
                onClick={() => void submitPassword()}
              >
                {loading ? "…" : "Enter →"}
              </AccentButton>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}
