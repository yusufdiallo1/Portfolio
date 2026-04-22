"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useSpring as useFramerSpring, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";

import { ErrorBoundary } from "@/components/portfolio/error-boundary";
import { AccentButton } from "@/components/ui/accent-button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/* ── Dynamic import — skips SSR entirely for the WebGL canvas ── */
const Hero3DCanvas = dynamic(() => import("@/components/portfolio/hero-3d-canvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0a0a0a]" />,
});

const CanvasFallback = () => (
  <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
    <div className="absolute inset-0 opacity-10" 
      style={{ 
        backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 0%, transparent 70%)',
        filter: 'blur(100px)'
      }} 
    />
  </div>
);

/* ── Content Constants ─────────────────────────────────────── */
const HERO_QUOTES = [
  "Impossible is a big word thrown by a small man.",
  "Good software is never finished — it just stops needing to be fixed.",
  "If my mind can conceive it, and my heart can believe it – then I can achieve it.",
  "Every great app started as a blank page and someone who refused to stay stuck.",
];

const SUBSTACK: { word: string; color: string }[] = [
  { word: "ClaudeCode", color: "var(--react)" },
  { word: "Cursor", color: "var(--html)" },
  { word: "Next.js", color: "var(--ts)" },
  { word: "Supabase", color: "var(--go)" },
  { word: "Tailwind", color: "var(--react)" },
];

const PROJECT_PILLS: { href: string; label: string; glow: string }[] = [
  { href: "https://thecuratedroute.us", label: "thecuratedroute.us", glow: "var(--ts)" },
  { href: "https://noteley.lovable.app", label: "noteley.lovable.app", glow: "var(--css)" },
  { href: "https://firststepfinder.lovable.app", label: "firststepfinder.lovable.app", glow: "var(--go)" },
];

const MARQUEE =
  "React · Next.js · TypeScript · Supabase · Tailwind · ClaudeCode · Cursor · Vite · Git · API Integration · Full Stack · ";

/* ── Framer variants ────────────────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.8, ease: [0, 0, 0.58, 1] as const } },
};

/* ── Components ────────────────────────────────────────────── */

function OverlayEffects() {
  return (
    <>
      {/* Scanlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.015) 2px,rgba(255,255,255,0.015) 4px)",
        }}
      />
      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            "radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,0.85) 100%)",
        }}
      />
      {/* Ground fog */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[4] h-64"
        style={{ background: "linear-gradient(to top,#0a0a0a 0%,transparent 100%)" }}
      />
    </>
  );
}

function HeroTypingQuote({ reduceMotion }: { reduceMotion: boolean | null }) {
  const [displayed, setDisplayed] = useState("");
  const quoteRef = useRef<string | null>(null);
  
  if (quoteRef.current === null) {
    const key = "yd_quote_idx";
    let prev = -1;
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) prev = parseInt(raw, 10);
    } catch { }
    const next = ((isNaN(prev) ? -1 : prev) + 1) % HERO_QUOTES.length;
    try { localStorage.setItem(key, String(next)); } catch { }
    quoteRef.current = HERO_QUOTES[next]!;
  }
  const quote = quoteRef.current;

  useEffect(() => {
    if (reduceMotion) {
      setDisplayed(quote);
      return;
    }
    const startDelayMs = 1500;
    const charMs = 30;
    let intervalId: number | undefined;

    const startTimer = window.setTimeout(() => {
      let i = 0;
      intervalId = window.setInterval(() => {
        i += 1;
        setDisplayed(quote.slice(0, i));
        if (i >= quote.length && intervalId !== undefined) {
          window.clearInterval(intervalId);
          intervalId = undefined;
        }
      }, charMs);
    }, startDelayMs);

    return () => {
      window.clearTimeout(startTimer);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [reduceMotion, quote]);

  return (
    <motion.blockquote
      variants={fadeUp}
      className="mt-8 max-w-2xl border-l-2 border-[var(--glass-border)] pl-5"
      role="status"
      aria-live="polite"
    >
      <p className="font-mono text-sm leading-relaxed md:text-base">
        <span className="text-[var(--text-primary)]">{displayed}</span>
        <span
          className="hero-cursor ml-0.5 inline-block h-[1em] w-px translate-y-px bg-white align-middle"
          aria-hidden
        />
      </p>
    </motion.blockquote>
  );
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null!);
  const reduceMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({ 
    target: sectionRef, 
    offset: ["start start", "end start"] 
  });
  
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const parallaxSpring = useFramerSpring(parallaxY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(".hero-parallax-layer", {
        y: -50,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const scrollToId = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen overflow-hidden bg-[#0a0a0a]"
    >
      {/* 3D animated background layer */}
      <motion.div 
        className="absolute inset-0 z-0" 
        style={{ y: parallaxSpring }}
      >
        <ErrorBoundary fallback={<CanvasFallback />}>
          <Hero3DCanvas />
        </ErrorBoundary>
      </motion.div>

      <OverlayEffects />

      {/* Main Content */}
      <motion.div
        className="relative z-10 flex min-h-screen flex-col justify-center px-gutter pb-28 pt-24 md:pl-[max(2rem,9vw)] md:pt-28"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="max-w-4xl">
          <motion.p
            variants={fadeUp}
            className="mb-5 font-mono text-xs tracking-wide text-[var(--text-muted)] md:text-sm"
          >
            {"// full stack developer"}
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-display text-balance font-normal leading-[1.05] tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(3.5rem, 8vw, 6rem)" }}
          >
            I Ship Products That Work.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="font-display mt-4 text-balance font-normal leading-[1.15] tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
          >
            <span className="text-[var(--js)]">Fast.</span>{" "}
            <span className="text-[var(--react)]">Clean.</span>{" "}
            <span className="text-[var(--go)]">Shipped.</span>
          </motion.p>

          <HeroTypingQuote reduceMotion={reduceMotion} />

          <motion.p
            variants={fadeUp}
            className="mt-6 font-mono text-xs text-[var(--text-secondary)] md:text-sm"
          >
            {SUBSTACK.map((item, i) => (
              <span key={item.word}>
                {i > 0 && <span className="text-[var(--text-muted)]"> · </span>}
                <span style={{ color: item.color }}>{item.word}</span>
              </span>
            ))}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
            <AccentButton
              type="button"
              variant="filled"
              className="h-11 px-6 font-mono"
              onClick={() => scrollToId("hire")}
            >
              Hire Me →
            </AccentButton>
            <AccentButton
              type="button"
              variant="ghost"
              className="h-11 px-6 font-mono"
              onClick={() => scrollToId("projects")}
            >
              View Projects
            </AccentButton>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            {PROJECT_PILLS.map((p) => (
              <motion.a
                key={p.href}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "liquid-pill group inline-flex items-center gap-1.5 px-3 py-2 font-mono text-[11px] text-[var(--text-secondary)] border border-[var(--glass-border)] transition-[box-shadow,border-color,color] duration-300",
                  "hover:text-[var(--text-primary)]"
                )}
                whileHover={{
                  boxShadow: `0 0 28px color-mix(in srgb, ${p.glow} 24%, transparent)`,
                  borderColor: `color-mix(in srgb, ${p.glow} 38%, var(--glass-border))`,
                }}
              >
                <span className="text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-secondary)]">
                  ↗
                </span>
                {p.label}
              </motion.a>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom UI */}
      <motion.div
        className="relative z-10 mt-auto flex flex-col gap-6 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
            SCROLL
          </span>
          <motion.div
            animate={reduceMotion ? {} : { y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="size-5 text-[var(--text-muted)]" strokeWidth={1.5} />
          </motion.div>
        </div>

        <div className="relative overflow-hidden border-t border-[var(--glass-border)]/35 py-3 bg-black/20 backdrop-blur-sm">
          <div className="hero-marquee-track flex w-max font-mono text-[11px] text-[var(--text-muted)] md:text-xs">
            <span className="inline-block shrink-0 pr-20">{MARQUEE}</span>
            <span className="inline-block shrink-0 pr-20" aria-hidden>{MARQUEE}</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
