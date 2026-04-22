"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

import { TechBadge } from "@/components/ui/tech-badge";
import { cn } from "@/lib/utils";
import type { PortfolioProject } from "@/lib/portfolio-projects";
import { getTechColor } from "@/lib/tech-colors";
import { track } from "@/lib/analytics";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
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

type ProjectsProps = {
  projects: PortfolioProject[];
};

function TiltCard({
  children,
  accent,
  className,
}: {
  children: React.ReactNode;
  accent: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 22,
  });

  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, color-mix(in srgb, ${accent} 22%, transparent) 0%, transparent 60%)`
  );

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
    glowX.set(((e.clientX - rect.left) / rect.width) * 100);
    glowY.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  const onLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    glowX.set(50);
    glowY.set(50);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        reduceMotion
          ? {}
          : { rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }
      }
      className={className}
    >
      {/* Follow-mouse glow */}
      {!reduceMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glowBackground }}
          aria-hidden
        />
      )}
      {children}
    </motion.div>
  );
}

export function Projects({ projects }: ProjectsProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="projects"
      className="relative scroll-mt-32 border-b border-[var(--glass-border)]/40 bg-[#000000] text-[var(--text-primary)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

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
          {"// projects"}
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display mb-10 text-balance text-[clamp(2rem,5vw,3rem)] font-normal tracking-[-0.02em] text-white md:mb-12"
        >
          What I&apos;ve Built
        </motion.h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const firstTag = project.tags[0] ?? "Next.js";
            const accent = getTechColor(firstTag);

            return (
              <motion.div key={project.id} variants={fadeUp}>
              <TiltCard accent={accent} className="group relative h-full">
              <motion.article
                className="liquid-surface relative flex h-full flex-col overflow-hidden rounded-xl transition-[border-color,box-shadow] duration-300"
                style={
                  {
                    ["--project-accent" as string]: accent,
                  } as React.CSSProperties
                }
              >
                <div
                  className="relative aspect-video w-full overflow-hidden border-b border-[var(--glass-border)]/50 bg-black/40"
                >
                  {project.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- CMS + /public paths
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover object-top transition-[filter,transform] duration-300 group-hover:brightness-110"
                    />
                  ) : (
                    <div
                      className="flex h-full min-h-[140px] w-full items-center justify-center transition-[filter] duration-300 group-hover:brightness-110"
                      style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 35%, #0a0a0a) 0%, #000000 55%, color-mix(in srgb, ${accent} 12%, #000000) 100%)`,
                      }}
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="font-mono text-base font-medium text-white md:text-[17px]">
                    {project.title}
                  </h3>
                  <p className="font-mono text-xs leading-relaxed text-[var(--text-muted)] md:text-[13px]">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <TechBadge key={tag} tech={tag} size="sm" />
                    ))}
                  </div>
                  <div className="mt-auto pt-2">
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => void track("project_click", { project: project.title, url: project.url })}
                      className={cn(
                        "inline-flex h-9 items-center justify-center rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-xs font-mono text-[var(--text-primary)] backdrop-blur-md transition-[border-color,background-color,box-shadow] duration-200",
                        "hover:border-[color:var(--project-accent)] hover:bg-[var(--glass-bg-hover)] hover:shadow-[0_0_24px_color-mix(in_srgb,var(--project-accent)_22%,transparent)]"
                      )}
                    >
                      ↗ View Live
                    </a>
                  </div>
                </div>

                <span
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 45%, transparent)`,
                  }}
                  aria-hidden
                />
              </motion.article>
              </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
