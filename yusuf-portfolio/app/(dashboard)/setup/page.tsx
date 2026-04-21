"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CodeRain } from "@/components/dashboard/code-rain";
import { AccentButton } from "@/components/ui/accent-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Eye, EyeOff } from "lucide-react";

const schema = z
  .object({
    adminId: z.string().min(4, "At least 4 characters"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function SetupPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: values.adminId.trim(),
          password: values.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Setup failed");
        return;
      }
      toast.success("Dashboard secured. Welcome.");
      router.refresh();
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-12">
      <CodeRain />
      <GlassCard className="relative z-10 w-full max-w-[400px] p-8">
        <header className="mb-8 space-y-2">
          <h1 className="font-display text-3xl text-[var(--text-primary)]">Welcome, Yusuf.</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Set up your dashboard access. This only runs once.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="adminId" className="text-xs text-[var(--text-secondary)]">
              Choose your Admin ID
            </label>
            <input
              id="adminId"
              autoComplete="username"
              className="w-full rounded-lg border border-[var(--glass-border)] bg-black/40 px-3 py-2.5 font-mono text-sm text-[var(--text-primary)] outline-none ring-white/10 placeholder:text-[var(--text-muted)] focus:border-[var(--glass-border-hover)] focus:ring-2 focus:ring-white/20"
              placeholder="e.g. yusuf2025"
              {...register("adminId")}
            />
            {errors.adminId && (
              <p className="text-xs text-[var(--rust)]">{errors.adminId.message}</p>
            )}
            <p className="text-xs text-[var(--text-muted)]">
              You&apos;ll type this first when logging in
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-xs text-[var(--text-secondary)]">
              Create a Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                className="w-full rounded-lg border border-[var(--glass-border)] bg-black/40 px-3 py-2.5 pr-10 font-mono text-sm text-[var(--text-primary)] outline-none ring-white/10 placeholder:text-[var(--text-muted)] focus:border-[var(--glass-border-hover)] focus:ring-2 focus:ring-white/20"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[var(--rust)]">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-xs text-[var(--text-secondary)]">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPw2 ? "text" : "password"}
                autoComplete="new-password"
                className="w-full rounded-lg border border-[var(--glass-border)] bg-black/40 px-3 py-2.5 pr-10 font-mono text-sm text-[var(--text-primary)] outline-none ring-white/10 placeholder:text-[var(--text-muted)] focus:border-[var(--glass-border-hover)] focus:ring-2 focus:ring-white/20"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                onClick={() => setShowPw2((s) => !s)}
                aria-label={showPw2 ? "Hide password" : "Show password"}
              >
                {showPw2 ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-[var(--rust)]">{errors.confirmPassword.message}</p>
            )}
          </div>

          <AccentButton type="submit" variant="filled" className="w-full" disabled={submitting}>
            {submitting ? "Creating…" : "Create Access"}
          </AccentButton>
        </form>
      </GlassCard>
    </div>
  );
}
