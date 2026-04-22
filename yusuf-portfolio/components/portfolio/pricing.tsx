"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { AccentButton } from "@/components/ui/accent-button";
import { cn } from "@/lib/utils";
import type { PricingTier } from "@/lib/portfolio-pricing";
import { sounds } from "@/lib/sounds";

const CHECK_COLORS = ["var(--js)", "var(--react)", "var(--go)"] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

function scrollToHire() {
  document.getElementById("hire")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type PricingProps = {
  tiers: PricingTier[];
};

export function Pricing({ tiers }: PricingProps) {
  const reduceMotion = useReducedMotion();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleScope = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    sounds.click();
  };

  return (
    <section
      id="pricing"
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
          {"// pricing"}
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display mb-3 text-balance text-[clamp(2rem,5vw,3rem)] font-normal tracking-[-0.02em] text-white"
        >
          Simple Pricing
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mb-10 max-w-2xl font-mono text-sm text-[var(--text-muted)] md:mb-12 md:text-base"
        >
          No hourly rates. No surprises. Pick a tier.
        </motion.p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-stretch">
          {tiers.map((tier) => {
            const highlighted = tier.highlighted;
            const isExpanded = expandedId === tier.id;

            return (
              <motion.article
                key={tier.id}
                variants={fadeUp}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-xl border transition-[transform,box-shadow,border-color] duration-300",
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
                  <p className="font-label text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {tier.name.toUpperCase()}
                  </p>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span
                      className="font-display text-[48px] font-normal leading-none tracking-[-0.02em] text-white"
                    >
                      {tier.price}
                    </span>
                    <span className="font-mono text-sm text-[var(--text-muted)]">
                      /{tier.billingPeriod}
                    </span>
                  </div>
                  <p className="mt-4 font-mono text-sm leading-relaxed text-[var(--text-muted)]">
                    {tier.description}
                  </p>

                  <div className="my-6 h-px w-full bg-[var(--glass-border)]" />

                  <ul className="flex flex-1 flex-col gap-3">
                    {tier.features.map((f, i) => (
                      <li
                        key={f}
                        className="flex gap-2 font-mono text-sm text-white"
                      >
                        <span
                          className="shrink-0 font-medium"
                          style={{ color: CHECK_COLORS[i % CHECK_COLORS.length] }}
                          aria-hidden
                        >
                          ✓
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <AnimatePresence>
                    {isExpanded && tier.fullScope && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 border-t border-[var(--glass-border)]/50 pt-6">
                          <p className="font-mono text-xs leading-relaxed text-[var(--text-secondary)]">
                            {tier.fullScope}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={() => toggleScope(tier.id)}
                    className="mt-6 self-start font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] transition-colors hover:text-white"
                  >
                    {isExpanded ? "− Hide Scope" : "+ View Full Scope"}
                  </button>

                  <div className="mt-8">
                    <AccentButton
                      type="button"
                      variant={highlighted ? "filled" : "ghost"}
                      className="w-full font-mono"
                      onClick={() => {
                        scrollToHire();
                        sounds.click();
                      }}
                    >
                      Start a project
                    </AccentButton>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
