"use client";

import { motion, useReducedMotion } from "framer-motion";

import { AnimatedCounter } from "@/components/ui/animated-counter";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

function AboutTerminal() {
  return (
    <div
      className={cn(
        "liquid-surface overflow-hidden rounded-xl",
        "shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      )}
    >
      <div className="flex items-center gap-2 border-b border-[var(--glass-border)] bg-black/40 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[var(--rust)]" />
          <span className="size-2.5 rounded-full bg-[var(--js)]" />
          <span className="size-2.5 rounded-full bg-[var(--go)]" />
        </span>
        <span className="font-label text-[11px] text-[var(--text-muted)] md:text-xs">about.js</span>
      </div>
      <pre className="max-h-[min(420px,52vh)] overflow-auto p-4 font-label text-[11px] leading-[1.65] text-[var(--text-secondary)] md:text-xs md:leading-[1.7]">
        <code>
          <span className="syntax-keyword">const</span> <span className="syntax-fn">yusuf</span>{" "}
          <span className="text-[var(--text-muted)]">=</span> <span className="text-[var(--text-primary)]">{"{"}</span>
          {"\n  "}
          <span className="text-[var(--text-secondary)]">name</span>
          <span className="text-[var(--text-muted)]">: </span>
          <span className="syntax-string">&quot;Yusuf Diallo&quot;</span>
          <span className="text-[var(--text-muted)]">,</span>
          {"\n  "}
          <span className="text-[var(--text-secondary)]">role</span>
          <span className="text-[var(--text-muted)]">: </span>
          <span className="syntax-string">&quot;Full Stack Developer&quot;</span>
          <span className="text-[var(--text-muted)]">,</span>
          {"\n  "}
          <span className="text-[var(--text-secondary)]">tools</span>
          <span className="text-[var(--text-muted)]">: </span>
          <span className="text-[var(--text-primary)]">[</span>
          {"\n    "}
          <span className="syntax-string">&quot;ClaudeCode&quot;</span>
          <span className="text-[var(--text-muted)]">,</span>
          {"\n    "}
          <span className="syntax-string">&quot;Cursor&quot;</span>
          <span className="text-[var(--text-muted)]">,</span>
          {"\n    "}
          <span className="syntax-string">&quot;Next.js&quot;</span>
          <span className="text-[var(--text-muted)]">,</span>
          {"\n  "}
          <span className="text-[var(--text-primary)]">]</span>
          <span className="text-[var(--text-muted)]">,</span>
          {"\n  "}
          <span className="text-[var(--text-secondary)]">builds</span>
          <span className="text-[var(--text-muted)]">: </span>
          <span className="syntax-string">&quot;fast&quot;</span>
          <span className="text-[var(--text-muted)]">,</span>
          {"\n  "}
          <span className="text-[var(--text-secondary)]">apps</span>
          <span className="text-[var(--text-muted)]">: </span>
          <span className="text-[var(--text-primary)]">[</span>
          {"\n    "}
          <span className="syntax-string">&quot;thecuratedroute.us&quot;</span>
          <span className="text-[var(--text-muted)]">,</span>
          {"\n    "}
          <span className="syntax-string">&quot;noteley.lovable.app&quot;</span>
          <span className="text-[var(--text-muted)]">,</span>
          {"\n  "}
          <span className="text-[var(--text-primary)]">]</span>
          <span className="text-[var(--text-muted)]">,</span>
          {"\n  "}
          <span className="text-[var(--text-secondary)]">available</span>
          <span className="text-[var(--text-muted)]">: </span>
          <span className="text-[var(--rust)]">true</span>
          <span className="text-[var(--text-muted)]">,</span>
          {"\n"}
          <span className="text-[var(--text-primary)]">{"}"}</span>
          <span className="hero-cursor ml-0.5 inline-block h-[1em] w-px bg-white align-middle" aria-hidden />
        </code>
      </pre>
    </div>
  );
}

export function About() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="about"
      className="relative scroll-mt-32 border-b border-[var(--glass-border)]/40 bg-[#000000] text-[var(--text-primary)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgba(255,255,255,0.14) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <motion.div
        className="relative z-10 mx-auto max-w-wide px-gutter py-section"
        variants={stagger}
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-12% 0px" }}
      >
        <motion.p
          variants={fadeUp}
          className="mb-3 font-mono text-xs text-[var(--text-muted)] md:text-sm"
        >
          {"// about"}
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display mb-12 text-balance text-[clamp(2rem,5vw,3rem)] font-normal tracking-[-0.02em] text-white"
        >
          Yusuf Diallo
        </motion.h2>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-14 lg:gap-16">
          <motion.div variants={fadeUp} className="flex min-w-0 flex-col gap-10">
            <p className="max-w-prose text-body-lg leading-relaxed text-[var(--text-secondary)]">
              I&apos;m a Full Stack Developer who ships fast. I build with modern tools — ClaudeCode,
              Cursor, Next.js, Supabase — turning ideas into production apps quickly. No fluff, just clean
              code and real results.
            </p>

            <div
              className="flex flex-col gap-6 sm:flex-row sm:items-stretch sm:divide-x sm:divide-[var(--glass-border)]"
              role="list"
            >
              <div className="flex flex-1 flex-col gap-1.5 sm:pr-8" role="listitem">
                <span className="font-display text-[clamp(2.25rem,4vw,3rem)] leading-none tracking-[-0.02em] text-white">
                  <AnimatedCounter target={10} suffix="+" />
                </span>
                <span className="font-mono text-xs text-[var(--text-muted)]">Projects Delivered</span>
              </div>
              <div
                className="flex flex-1 flex-col gap-1.5 border-t border-[var(--glass-border)] pt-6 sm:border-t-0 sm:pt-0 sm:pl-8"
                role="listitem"
              >
                <span className="font-display text-[clamp(2.25rem,4vw,3rem)] leading-none tracking-[-0.02em] text-white">
                  <AnimatedCounter target={3} />
                </span>
                <span className="font-mono text-xs text-[var(--text-muted)]">Live Apps</span>
              </div>
              <div
                className="flex flex-1 flex-col gap-1.5 border-t border-[var(--glass-border)] pt-6 sm:border-t-0 sm:pt-0 sm:pl-8"
                role="listitem"
              >
                <span className="font-display text-[clamp(2.25rem,4vw,3rem)] leading-none tracking-[-0.02em] text-white">
                  Fast
                </span>
                <span className="font-mono text-xs text-[var(--text-muted)]">Turnaround</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="min-w-0">
            <AboutTerminal />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
