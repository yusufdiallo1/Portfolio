"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const ACCENT_ROTATE = ["var(--js)", "var(--react)", "var(--go)"] as const;

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is ClaudeCode?",
    a: "ClaudeCode is Anthropic's AI coding agent that runs in the terminal. I use it to write, debug, and ship code significantly faster — it's like pair programming with a very fast senior dev.",
  },
  {
    q: "How fast do you actually build?",
    a: "Landing pages: 2–3 days. Full web apps: 5–10 days. SaaS platforms: 10–14 days. I use AI-assisted tools (ClaudeCode + Cursor) to move fast without cutting corners.",
  },
  {
    q: "What's in your stack?",
    a: "Next.js, React, TypeScript, Tailwind CSS, Supabase, Framer Motion, shadcn/ui. I also integrate any API you need — Stripe, OpenAI, Resend, etc.",
  },
  {
    q: "Can you build with AI features?",
    a: "Yes — that's a specialty. Chatbots, AI pipelines, image generation, document analysis. I've integrated Anthropic Claude and Llama (via Groq) into production apps.",
  },
  {
    q: "Do you work on existing codebases?",
    a: "Yes. Share your repo and I'll scope what needs doing. I can add features, fix bugs, refactor, or extend.",
  },
  {
    q: "How do revisions work?",
    a: "Starter: 1 round. Pro: 3 rounds. Elite: unlimited. A revision = a batch of feedback applied to the delivered work.",
  },
  {
    q: "What happens after I submit the hire form?",
    a: "I personally review every request within 24 hours and respond with a proposal, timeline, and any questions.",
  },
  {
    q: "Do you handle deployment?",
    a: "Yes. Every project ships to Vercel (or your preferred host) with proper environment setup, domain config, and a handoff document.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export function Faq() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative scroll-mt-32 border-b border-[var(--glass-border)]/40 bg-[#000000] pb-section text-[var(--text-primary)]"
    >
      <motion.div
        className="relative z-10 mx-auto max-w-wide px-gutter pt-section"
        variants={stagger}
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-10% 0px" }}
      >
        <motion.p
          variants={fadeUp}
          className="mb-3 font-mono text-xs text-[var(--text-muted)] md:text-sm"
        >
          {"// faq"}
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display mb-10 text-balance text-[clamp(2rem,5vw,3rem)] font-normal tracking-[-0.02em] text-white md:mb-12"
        >
          Questions
        </motion.h2>

        <div className="flex flex-col gap-3">
          {FAQS.map((item, index) => {
            const isOpen = open === index;
            const accent = ACCENT_ROTATE[index % ACCENT_ROTATE.length];
            return (
              <motion.div key={item.q} variants={fadeUp}>
                <div
                  className={cn(
                    "liquid-surface overflow-hidden rounded-xl transition-[border-color] duration-200",
                    isOpen && "border-[color:var(--faq-accent)]"
                  )}
                  style={{ ["--faq-accent" as string]: accent } as React.CSSProperties}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    className={cn(
                      "flex w-full items-start justify-between gap-4 border-l-2 p-5 pl-[calc(1.25rem-2px)] text-left font-mono text-sm text-white transition-colors md:text-[15px]",
                      isOpen ? "border-[color:var(--faq-accent)]" : "border-transparent"
                    )}
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={cn(
                        "mt-0.5 size-5 shrink-0 text-[var(--text-muted)] transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                      strokeWidth={1.5}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-[var(--glass-border)]/50 px-5 pb-5 pt-0">
                      <p className="pt-4 font-mono text-[13px] leading-relaxed text-[var(--text-muted)] md:text-sm">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
