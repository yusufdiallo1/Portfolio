"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useSpring as useFramerSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { AccentButton } from "@/components/ui/accent-button";

gsap.registerPlugin(ScrollTrigger);

/* ── Dynamic import — skips SSR entirely for the WebGL canvas ── */
const Hero3DCanvas = dynamic(() => import("@/components/portfolio/hero-3d-canvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0a0a0a]" />,
});

/* ── Brand palette ─────────────────────────────────────────── */
const C = {
  react: "#61dafb",
  ts:    "#3178c6",
  js:    "#f7df1e",
  go:    "#00add8",
  css:   "#ff6b9d",
} as const;

/* ── Framer variants ────────────────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.55 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 1.1, ease: [0, 0, 0.58, 1] as const } },
};

/* ── Scroll-parallax hook ───────────────────────────────────── */
function useParallax(ref: React.RefObject<HTMLElement>) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const raw = useTransform(scrollYProgress, [0, 1], [0, -140]);
  return useFramerSpring(raw, { stiffness: 60, damping: 20 });
}

/* ── GSAP fade-out on scroll ────────────────────────────────── */
function useScrollFadeOut(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 1 },
        {
          opacity: 0,
          ease: "power2.in",
          scrollTrigger: {
            trigger: el,
            start: "40% top",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [ref]);
}

/* ── Overlay elements ───────────────────────────────────────── */
function ScanLines() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[3]"
      style={{
        background:
          "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)",
      }}
    />
  );
}

function Vignette() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[3]"
      style={{
        background:
          "radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,0.72) 100%)",
      }}
    />
  );
}

function GroundFog() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-0 left-0 right-0 z-[4] h-52"
      style={{ background: "linear-gradient(to top,#0a0a0a 0%,transparent 100%)" }}
    />
  );
}

/* ── Hero text ──────────────────────────────────────────────── */
function HeroText({ onHire, onProjects }: { onHire: () => void; onProjects: () => void }) {
  return (
    <motion.div
      className="relative z-10 flex min-h-screen flex-col justify-center px-6 pb-28 pt-32 md:px-[max(3rem,8vw)]"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.p
        variants={fadeUp}
        className="mb-5 font-mono text-xs uppercase tracking-[0.22em] opacity-90"
        style={{ color: C.react }}
      >
        {"// full stack developer"}
      </motion.p>

      <motion.h2
        variants={fadeUp}
        className="font-display font-normal leading-none tracking-[-0.03em] text-white"
        style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)", marginBottom: "0.35em", opacity: 0.55 }}
      >
        Yusuf Diallo
      </motion.h2>

      <motion.h1
        variants={fadeUp}
        className="max-w-3xl font-display font-normal leading-[1.04] tracking-[-0.03em] text-white"
        style={{ fontSize: "clamp(3.2rem, 7.5vw, 5.8rem)" }}
      >
        I Ship Products
        <br />
        <span
          style={{
            background: `linear-gradient(135deg, ${C.react} 0%, ${C.go} 50%, ${C.css} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          That Work.
        </span>
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-[var(--text-secondary)] md:text-base"
      >
        Fast.{" "}
        <span style={{ color: C.react }}>Clean.</span>{" "}
        <span style={{ color: C.js }}>Shipped.</span>{" "}
        — Building premium web experiences with modern tools.
      </motion.p>

      <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
        <AccentButton variant="filled" className="h-11 px-6 font-mono text-sm" onClick={onHire}>
          Hire Me →
        </AccentButton>
        <AccentButton variant="ghost" className="h-11 px-6 font-mono text-sm" onClick={onProjects}>
          View Projects
        </AccentButton>
      </motion.div>

      <motion.div variants={fadeIn} className="mt-12 flex flex-wrap items-center gap-3">
        {(
          [
            { label: "React",      color: C.react },
            { label: "Next.js",    color: "#ffffff" },
            { label: "TypeScript", color: C.ts },
            { label: "Supabase",   color: C.go },
            { label: "Tailwind",   color: C.css },
          ] as const
        ).map(({ label, color }) => (
          <span
            key={label}
            className="rounded-full border px-3 py-1 font-mono text-[11px] tracking-wide"
            style={{
              borderColor: `color-mix(in srgb,${color} 35%,transparent)`,
              background:  `color-mix(in srgb,${color} 10%,transparent)`,
              color,
            }}
          >
            {label}
          </span>
        ))}
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        variants={fadeIn}
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[var(--text-muted)]">
          scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: [0.45, 0, 0.55, 1] as const }}
          aria-hidden
          className="h-8 w-px bg-gradient-to-b from-[#61dafb] to-transparent"
        />
      </motion.div>
    </motion.div>
  );
}

/* ── Root export ────────────────────────────────────────────── */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null!);
  const parallaxY = useParallax(sectionRef);
  useScrollFadeOut(sectionRef);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      ref={sectionRef}
      id="hero-3d"
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#0a0a0a" }}
    >
      {/* 3D canvas — browser only, no SSR */}
      <motion.div className="absolute inset-0 z-[1]" style={{ y: parallaxY }}>
        <Hero3DCanvas />
      </motion.div>

      <ScanLines />
      <Vignette />
      <GroundFog />

      <div className="relative z-[5]">
        <HeroText
          onHire={() => scrollTo("hire")}
          onProjects={() => scrollTo("projects")}
        />
      </div>
    </section>
  );
}
