"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AccentButton } from "@/components/ui/accent-button";
import { GlassCard } from "@/components/ui/glass-card";
import { track } from "@/lib/analytics";
import {
  budgets,
  colorAccentOptions,
  deployTargets,
  hireFormSchema,
  type HireFormValues,
  projectTypes,
  techPillOptions,
  themePreferences,
  timelines,
} from "@/lib/hire-schema";
import { getTechColor } from "@/lib/tech-colors";
import { cn } from "@/lib/utils";
import { sounds } from "@/lib/sounds";

const STEPS = [
  { id: 1, short: "You", title: "About You" },
  { id: 2, short: "Project", title: "Your Project" },
  { id: 3, short: "Deploy", title: "Look & Deploy" },
  { id: 4, short: "Details", title: "Describe It" },
] as const;

const inputClass =
  "w-full rounded-lg border border-[var(--glass-border)] bg-black/65 px-3 py-2.5 font-label text-sm text-white outline-none transition-[border-color,box-shadow] placeholder:text-[var(--text-muted)] focus:border-[var(--react)] focus:ring-1 focus:ring-[var(--react)]";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const stepFields: (keyof HireFormValues)[][] = [
  ["name", "email"],
  ["projectType", "budget", "timeline", "techPreferences"],
  ["deployTarget", "themePreference", "colorAccents"],
  ["description"],
];

const ACCENT_PILL_COLORS = [
  "var(--react)",
  "var(--ts)",
  "var(--js)",
  "var(--go)",
  "var(--python)",
  "var(--css)",
  "var(--rust)",
  "var(--html)",
];

function accentPillColor(i: number) {
  return ACCENT_PILL_COLORS[i % ACCENT_PILL_COLORS.length];
}

export function HireForm() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const hireTracked = useRef(false);

  useEffect(() => {
    if (hireTracked.current) return;
    const el = document.getElementById("hire");
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hireTracked.current) {
          hireTracked.current = true;
          void track("hire_open");
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const form = useForm<HireFormValues>({
    resolver: zodResolver(hireFormSchema),
    defaultValues: {
      name: "",
      email: "",
      projectType: "landing_page",
      budget: "under_500",
      timeline: "flexible",
      techPreferences: [],
      deployTarget: "vercel",
      themePreference: "dark",
      colorAccents: [],
      description: "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const techPrefs = watch("techPreferences") ?? [];
  const colorAccents = watch("colorAccents") ?? [];

  function toggleTech(tech: string) {
    const next = techPrefs.includes(tech)
      ? techPrefs.filter((t) => t !== tech)
      : [...techPrefs, tech];
    setValue("techPreferences", next, { shouldValidate: true });
    sounds.click();
  }

  function toggleAccent(label: string) {
    const next = colorAccents.includes(label)
      ? colorAccents.filter((t) => t !== label)
      : [...colorAccents, label];
    setValue("colorAccents", next, { shouldValidate: true });
    sounds.click();
  }

  async function goNext() {
    const fields = stepFields[step];
    const ok = await trigger(fields, { shouldFocus: true });
    if (!ok) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    sounds.click();
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
    sounds.click();
  }

  async function onSubmit(values: HireFormValues) {
    try {
      const res = await fetch("/api/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(data.error ?? "Something went wrong.");
        return;
      }
      toast.success("Request received. I'll respond within 24h.");
      sounds.success();
      reset();
      setStep(0);
    } catch {
      toast.error("Network error. Try again.");
    }
  }

  const lastStep = STEPS.length - 1;

  return (
    <section
      id="hire"
      className="relative scroll-mt-32 border-b border-[var(--glass-border)]/40 bg-[#000000] text-[var(--text-primary)]"
    >
      <motion.div
        className="relative z-10 mx-auto max-w-wide px-gutter py-section"
        variants={stagger}
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-10% 0px" }}
      >
        <motion.p
          variants={fadeUp}
          className="mb-3 font-mono text-xs text-[var(--text-muted)] md:text-sm"
        >
          {"// hire"}
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display mb-3 text-balance text-[clamp(2rem,5vw,3rem)] font-normal tracking-[-0.02em] text-white"
        >
          Start a Project
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mb-10 font-mono text-sm text-[var(--text-muted)] md:mb-12 md:text-base"
        >
          Tell me exactly what you need — stack, deploy, and visual direction.
        </motion.p>

        <motion.div variants={fadeUp}>
          <GlassCard
            className="relative overflow-hidden p-0"
            glow="var(--react)"
            disableHoverScale
          >
            {/* Stepper */}
            <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[var(--glass-border)] bg-black/30 px-4 py-4 font-mono text-[11px] text-[var(--text-muted)] md:gap-4 md:text-xs">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 md:gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (i < step) {
                        setDirection(-1);
                        setStep(i);
                        sounds.click();
                      }
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors",
                      i === step && "bg-[var(--glass-bg)] text-[var(--text-primary)]",
                      i < step && "cursor-pointer text-[var(--text-secondary)] hover:text-white"
                    )}
                    disabled={i > step}
                  >
                    <span className="text-[var(--text-muted)]">{s.id}</span>
                    <span className="text-[var(--text-muted)]">·</span>
                    <span>{s.short}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <span className="hidden text-[var(--text-muted)] sm:inline" aria-hidden>
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="relative min-h-[min(420px,70vh)] overflow-hidden p-6 md:p-8"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={
                    reduceMotion ? false : { x: direction >= 0 ? 28 : -28, opacity: 0 }
                  }
                  animate={{ x: 0, opacity: 1 }}
                  exit={
                    reduceMotion ? undefined : { x: direction >= 0 ? -28 : 28, opacity: 0 }
                  }
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  {step === 0 && (
                    <>
                      <h3 className="font-label text-lg text-white">{STEPS[0].title}</h3>
                      <div className="space-y-2">
                        <label className="sr-only" htmlFor="hire-name">
                          Name
                        </label>
                        <input
                          id="hire-name"
                          type="text"
                          autoComplete="name"
                          placeholder="Your name"
                          className={inputClass}
                          {...register("name")}
                        />
                        <p className="font-mono text-[11px] text-[var(--text-muted)]">
                          {"// your name"}
                        </p>
                        {errors.name && (
                          <p className="font-mono text-xs text-[var(--rust)]">{errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="sr-only" htmlFor="hire-email">
                          Email
                        </label>
                        <input
                          id="hire-email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          className={inputClass}
                          {...register("email")}
                        />
                        <p className="font-mono text-[11px] text-[var(--text-muted)]">
                          {"// we'll respond here"}
                        </p>
                        {errors.email && (
                          <p className="font-mono text-xs text-[var(--rust)]">{errors.email.message}</p>
                        )}
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <h3 className="font-label text-lg text-white">{STEPS[1].title}</h3>
                      <div className="grid gap-4 md:grid-cols-1">
                        <div className="space-y-2">
                          <label className="font-mono text-xs text-[var(--text-muted)]">
                            Project type
                          </label>
                          <select className={inputClass} {...register("projectType")}>
                            {projectTypes.map((p) => (
                              <option key={p.value} value={p.value}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                          {errors.projectType && (
                            <p className="font-mono text-xs text-[var(--rust)]">
                              {errors.projectType.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="font-mono text-xs text-[var(--text-muted)]">Budget</label>
                          <select className={inputClass} {...register("budget")}>
                            {budgets.map((b) => (
                              <option key={b.value} value={b.value}>
                                {b.label}
                              </option>
                            ))}
                          </select>
                          {errors.budget && (
                            <p className="font-mono text-xs text-[var(--rust)]">{errors.budget.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="font-mono text-xs text-[var(--text-muted)]">Timeline</label>
                          <select className={inputClass} {...register("timeline")}>
                            {timelines.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                          {errors.timeline && (
                            <p className="font-mono text-xs text-[var(--rust)]">
                              {errors.timeline.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-mono text-xs text-[var(--text-muted)]">Tech preferences</p>
                        <div className="flex flex-wrap gap-2">
                          {techPillOptions.map((tech) => {
                            const active = techPrefs.includes(tech);
                            const color = getTechColor(tech);
                            return (
                              <button
                                key={tech}
                                type="button"
                                onClick={() => toggleTech(tech)}
                                className={cn(
                                  "rounded-full border px-3 py-1.5 font-mono text-xs transition-[border-color,box-shadow,color,background]",
                                  active
                                    ? "border-[color:var(--pill)] bg-[color-mix(in_srgb,var(--pill)_18%,transparent)] text-white"
                                    : "border-[var(--glass-border)] bg-black/40 text-[var(--text-secondary)] hover:border-[var(--glass-border-hover)]"
                                )}
                                style={
                                  {
                                    ["--pill" as string]: color,
                                  } as React.CSSProperties
                                }
                              >
                                {tech}
                              </button>
                            );
                          })}
                        </div>
                        {errors.techPreferences && (
                          <p className="font-mono text-xs text-[var(--rust)]">
                            {errors.techPreferences.message}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h3 className="font-label text-lg text-white">{STEPS[2].title}</h3>
                      <p className="font-mono text-xs text-[var(--text-muted)]">
                        Where it ships, how it looks, and the palette direction.
                      </p>
                      <div className="space-y-2">
                        <label className="font-mono text-xs text-[var(--text-muted)]">
                          Deploy target
                        </label>
                        <select className={inputClass} {...register("deployTarget")}>
                          {deployTargets.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                        {errors.deployTarget && (
                          <p className="font-mono text-xs text-[var(--rust)]">
                            {errors.deployTarget.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-xs text-[var(--text-muted)]">UI theme</label>
                        <select className={inputClass} {...register("themePreference")}>
                          {themePreferences.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        {errors.themePreference && (
                          <p className="font-mono text-xs text-[var(--rust)]">
                            {errors.themePreference.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="font-mono text-xs text-[var(--text-muted)]">
                          Color & palette direction
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {colorAccentOptions.map((label, i) => {
                            const active = colorAccents.includes(label);
                            const color = accentPillColor(i);
                            return (
                              <button
                                key={label}
                                type="button"
                                onClick={() => toggleAccent(label)}
                                className={cn(
                                  "rounded-full border px-3 py-1.5 font-mono text-xs transition-[border-color,box-shadow,color,background]",
                                  active
                                    ? "border-[color:var(--pill)] bg-[color-mix(in_srgb,var(--pill)_18%,transparent)] text-white"
                                    : "border-[var(--glass-border)] bg-black/40 text-[var(--text-secondary)] hover:border-[var(--glass-border-hover)]"
                                )}
                                style={
                                  {
                                    ["--pill" as string]: color,
                                  } as React.CSSProperties
                                }
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                        {errors.colorAccents && (
                          <p className="font-mono text-xs text-[var(--rust)]">
                            {errors.colorAccents.message}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <h3 className="font-label text-lg text-white">{STEPS[3].title}</h3>
                      <div className="flex overflow-hidden rounded-lg border border-[var(--glass-border)] bg-black/70 focus-within:border-[var(--react)] focus-within:ring-1 focus-within:ring-[var(--react)]">
                        <div
                          className="hidden w-10 shrink-0 select-none border-r border-[var(--glass-border)] py-2 pr-2 text-right font-mono text-[11px] leading-[1.65] text-[var(--text-muted)] sm:block"
                          aria-hidden
                        >
                          {Array.from({ length: 8 }, (_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </div>
                        <textarea
                          rows={8}
                          placeholder={
                            "Describe your project in detail. What problem? Who's it for? Any references?"
                          }
                          className="min-h-[12rem] w-full resize-y bg-transparent px-3 py-2 font-mono text-sm leading-[1.65] text-white outline-none placeholder:text-[var(--text-muted)] sm:px-2"
                          {...register("description")}
                        />
                      </div>
                      {errors.description && (
                        <p className="font-mono text-xs text-[var(--rust)]">{errors.description.message}</p>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--glass-border)]/50 pt-6">
                {step > 0 ? (
                  <AccentButton type="button" variant="ghost" className="font-mono" onClick={goBack}>
                    ← Back
                  </AccentButton>
                ) : (
                  <span />
                )}
                {step < lastStep ? (
                  <AccentButton type="button" variant="filled" className="font-mono" onClick={goNext}>
                    Continue →
                  </AccentButton>
                ) : (
                  <AccentButton
                    type="submit"
                    variant="filled"
                    className="ml-auto w-full font-mono sm:w-auto sm:min-w-[200px]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending…
                      </span>
                    ) : (
                      "Send Request →"
                    )}
                  </AccentButton>
                )}
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </motion.div>
    </section>
  );
}
