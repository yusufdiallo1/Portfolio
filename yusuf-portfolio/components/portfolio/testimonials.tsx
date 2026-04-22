"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Star } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { GlassCard } from "@/components/ui/glass-card";
import type { PortfolioTestimonial } from "@/lib/portfolio-testimonials";
import { cn } from "@/lib/utils";

const QUOTE_MARK_COLORS = [
  "var(--react)",
  "var(--ts)",
  "var(--python)",
  "var(--go)",
  "var(--js)",
  "var(--css)",
];

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

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StarRow({ rating }: { rating: number }) {
  const n = Math.min(5, Math.max(1, Math.round(rating)));
  return (
    <div className="flex gap-0.5" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < n ? "fill-[var(--js)] text-[var(--js)]" : "text-[var(--text-muted)] opacity-35"
          )}
        />
      ))}
    </div>
  );
}

function TiltGlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 260, damping: 28 });
  const springY = useSpring(my, { stiffness: 260, damping: 28 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  function onMove(e: React.MouseEvent) {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    mx.set(px);
    my.set(py);
  }

  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={cn("break-inside-avoid perspective-[1000px]", className)}
      style={
        reduceMotion
          ? undefined
          : {
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }
      }
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="transform-gpu">{children}</div>
    </motion.div>
  );
}

function TestimonialCard({
  t,
  index,
}: {
  t: PortfolioTestimonial;
  index: number;
}) {
  const markColor = QUOTE_MARK_COLORS[index % QUOTE_MARK_COLORS.length];
  const avatarBg = QUOTE_MARK_COLORS[(index + 2) % QUOTE_MARK_COLORS.length];

  return (
    <TiltGlassCard className="mb-6">
      {/* Avatar + name sit OUTSIDE the glass card */}
      <div className="mb-4 flex items-center gap-3 px-1">
        {t.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={t.avatarUrl}
            alt={t.name}
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-[var(--glass-border)]"
          />
        ) : (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-mono text-xs font-medium text-white ring-1 ring-[var(--glass-border)]"
            style={{ backgroundColor: `color-mix(in srgb, ${avatarBg} 35%, black)` }}
          >
            {initials(t.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-medium text-white">{t.name}</p>
          <p className="font-mono text-xs text-[var(--text-muted)]">{t.role}</p>
        </div>
      </div>

      <GlassCard className="flex h-full flex-col p-5 md:p-6" disableHoverScale glow={markColor}>
        <div className="mb-3">
          <span
            className="font-display text-5xl leading-none opacity-90"
            style={{ color: markColor }}
            aria-hidden
          >
            &ldquo;
          </span>
        </div>
        <p className="font-mono text-[15px] leading-relaxed text-white md:text-base">{t.quote}</p>
        <div className="mt-5">
          <StarRow rating={t.rating} />
        </div>
      </GlassCard>
    </TiltGlassCard>
  );
}

function PlaceholderCards() {
  return (
    <>
      {[0, 1].map((i) => (
        <TiltGlassCard key={i} className="mb-6">
          <GlassCard className="flex h-full flex-col p-5 md:p-6" disableHoverScale glow="var(--go)">
            <div className="mb-3">
              <span className="font-display text-5xl leading-none text-[var(--go)] opacity-90" aria-hidden>
                &ldquo;
              </span>
            </div>
            <p className="font-mono text-[15px] leading-relaxed text-white md:text-base">
              Be the first to work with Yusuf
            </p>
            <div className="my-5 h-px w-full bg-[var(--glass-border)]" />
            <Link
              href="#hire"
              className="font-mono text-sm text-[var(--react)] underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Open the hire form →
            </Link>
          </GlassCard>
        </TiltGlassCard>
      ))}
    </>
  );
}

export function Testimonials({ testimonials }: { testimonials: PortfolioTestimonial[] }) {
  const reduceMotion = useReducedMotion();
  const hasData = testimonials.length > 0;

  return (
    <section
      id="testimonials"
      className="relative scroll-mt-32 border-b border-[var(--glass-border)]/40 bg-[#000000] text-[var(--text-primary)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(55,118,171,0.06),transparent_55%)]" />

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
          {"// testimonials"}
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display mb-10 text-balance text-[clamp(2rem,5vw,3rem)] font-normal tracking-[-0.02em] text-white md:mb-12"
        >
          What People Say
        </motion.h2>

        <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
          {hasData
            ? testimonials.map((t, i) => <TestimonialCard key={t.id} t={t} index={i} />)
            : <PlaceholderCards />}
        </div>
      </motion.div>
    </section>
  );
}
