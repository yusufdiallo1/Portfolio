"use client";

import { motion } from "framer-motion";

import { ReferralForm } from "@/components/portfolio/referral-form";
import { GlassCard } from "@/components/ui/glass-card";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const steps = [
  {
    title: "You refer",
    body: "Share the contact of someone who needs design, a site, or an app built — a friend, teammate, or client.",
  },
  {
    title: "They hire me",
    body: "I work with them to ship their project. You are not on the hook for scope — this is just an intro.",
  },
  {
    title: "You get rewarded",
    body: "After their project wraps, you get 5% off your next project as a thank-you.",
  },
] as const;

export function ReferPageContent() {
  return (
    <div className="mx-auto max-w-wide px-gutter pb-section">
      <motion.section
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.p variants={fadeUp} className="font-mono text-xs text-[var(--text-muted)] md:text-sm">
          {"// refer"}
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="font-display mt-2 text-balance text-[clamp(2rem,5vw,3rem)] font-normal tracking-[-0.02em] text-white"
        >
          Refer a Friend. Get Rewarded.
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-4 max-w-2xl font-mono text-sm text-[var(--text-muted)] md:text-base"
        >
          Know someone who needs a website or app built? Refer them and get 10% off your next project — or earn a cash
          bonus.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <GlassCard key={s.title} disableHoverScale className="flex h-full flex-col p-5 md:p-6">
              <p className="font-label text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {s.title}
              </p>
              <p className="mt-3 font-mono text-sm leading-relaxed text-[var(--text-secondary)]">{s.body}</p>
            </GlassCard>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-12">
          <ReferralForm />
        </motion.div>
      </motion.section>
    </div>
  );
}
