"use client";

import { motion, useReducedMotion } from "framer-motion";

import { SkillIcon } from "@/components/portfolio/skill-icons";
import { SkillsNetworkBg } from "@/components/portfolio/skills-network";
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
    transition: { staggerChildren: 0.06, delayChildren: 0.06 },
  },
};

type SkillItem = {
  name: string;
  description: string;
  color: string;
};

const FULL_STACK_UI: SkillItem[] = [
  {
    name: "Next.js",
    description: "App Router, SSR, and edge-ready deploys.",
    color: "var(--ts)",
  },
  {
    name: "React",
    description: "Components, hooks, and modern patterns.",
    color: "var(--react)",
  },
  {
    name: "TypeScript",
    description: "Typed APIs and safer refactors.",
    color: "var(--ts)",
  },
  {
    name: "Tailwind",
    description: "Utility-first UI at speed.",
    color: "var(--react)",
  },
  {
    name: "Vite",
    description: "Fast dev server and HMR.",
    color: "var(--css)",
  },
  {
    name: "Cursor",
    description: "AI-native editor workflow.",
    color: "var(--html)",
  },
  {
    name: "ClaudeCode",
    description: "Agentic coding with guardrails.",
    color: "var(--react)",
  },
  {
    name: "Web Design",
    description: "Layout, type, and motion systems.",
    color: "var(--css)",
  },
  {
    name: "Front-end",
    description: "Accessible, responsive interfaces.",
    color: "var(--js)",
  },
];

const DEPLOY_EDGE: SkillItem[] = [
  {
    name: "Vercel",
    description: "Edge network, previews, and zero-config Next.js.",
    color: "var(--text-primary)",
  },
  {
    name: "Netlify",
    description: "Deploys, forms, and serverless at the edge.",
    color: "var(--go)",
  },
];

const BACKEND_PLATFORM: SkillItem[] = [
  {
    name: "Supabase",
    description: "Postgres, auth, storage, and realtime.",
    color: "var(--go)",
  },
  {
    name: "Back-end",
    description: "Server logic, APIs, and data layers.",
    color: "var(--go)",
  },
  {
    name: "API Integration",
    description: "REST, webhooks, third-party SDKs.",
    color: "var(--go)",
  },
  {
    name: "Git",
    description: "Branches, merges, clean history.",
    color: "var(--rust)",
  },
  {
    name: "GitHub",
    description: "CI, reviews, and collaboration.",
    color: "var(--text-secondary)",
  },
];

function SkillCard({ skill }: { skill: SkillItem }) {
  const { name, description, color } = skill;

  return (
    <motion.article
      variants={fadeUp}
      className={cn(
        "liquid-surface group relative flex min-h-[7.25rem] flex-col overflow-hidden p-4 transition-[border-color,box-shadow,background-color] duration-300",
        "hover:border-[color:var(--skill-glow)]"
      )}
      style={
        {
          ["--skill-glow" as string]: color,
        } as React.CSSProperties
      }
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120% 80% at 20% 0%, color-mix(in srgb, ${color} 16%, transparent), transparent 55%)`,
        }}
        aria-hidden
      />
      <div className="relative flex flex-1 flex-col gap-3">
        <div
          className="transition-[filter,color] duration-300 group-hover:[filter:drop-shadow(0_0_12px_color-mix(in_srgb,var(--skill-glow)_55%,transparent))]"
          style={{ color }}
        >
          <SkillIcon name={name} />
        </div>
        <div>
          <h3 className="font-label text-sm font-medium text-white md:text-[15px]">{name}</h3>
          <p className="mt-1 font-mono text-[11px] leading-snug text-[var(--text-muted)] md:text-xs">
            {description}
          </p>
        </div>
      </div>
      <span
        className="pointer-events-none absolute inset-0 rounded-[14px] ring-0 transition-[box-shadow] duration-300 group-hover:shadow-[0_0_0_1px_var(--skill-glow)]"
        aria-hidden
      />
    </motion.article>
  );
}

function SkillGroup({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: SkillItem[];
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="space-y-1">
        <h3 className="font-label text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)] md:text-xs">
          {title}
        </h3>
        <p className="font-mono text-xs text-[var(--text-secondary)] md:text-sm">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((skill) => (
          <SkillCard key={skill.name} skill={skill} />
        ))}
      </div>
    </div>
  );
}

export function Skills() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="skills"
      className="relative scroll-mt-32 overflow-hidden border-b border-[var(--glass-border)]/40 bg-[#000000] text-[var(--text-primary)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
        <SkillsNetworkBg />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(97,218,251,0.05),transparent_55%)]" />

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
          {"// skills"}
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display mb-10 text-balance text-[clamp(2rem,5vw,3rem)] font-normal tracking-[-0.02em] text-white md:mb-12"
        >
          My Tech Stack
        </motion.h2>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-10">
          <motion.div variants={fadeUp}>
            <SkillGroup
              title="Full stack & UI"
              subtitle="Frameworks, styling, AI-assisted workflows, and product surfaces."
              items={FULL_STACK_UI}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <SkillGroup
              title="Backend & platform"
              subtitle="Data layer, APIs, shipping, and collaboration."
              items={BACKEND_PLATFORM}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <SkillGroup
              title="Deploy & edge"
              subtitle="Where production lives — including the stacks clients pick in the hire flow."
              items={DEPLOY_EDGE}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
