"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { AccentButton } from "@/components/ui/accent-button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const HERO_QUOTES = [
  "Impossible is a big word thrown by a small man.",
  "Good software is never finished — it just stops needing to be fixed.",
  "If my mind can conceive it, and my heart can believe it – then I can achieve it.",
  "Every great app started as a blank page and someone who refused to stay stuck.",
];

/** 8 drifting syntax fragments — opacity kept in 0.04–0.08 range */
const FLOATING_SNIPPETS: {
  text: string;
  top: string;
  left: string;
  duration: number;
  delay: number;
}[] = [
  { text: "const deploy = async () => {", top: "8%", left: "4%", duration: 28, delay: 0 },
  { text: "npx create-next-app", top: "18%", left: "72%", duration: 32, delay: 2 },
  { text: "@apply glass;", top: "42%", left: "6%", duration: 24, delay: 1 },
  { text: "supabase.from('projects')", top: "58%", left: "68%", duration: 30, delay: 3 },
  { text: "export default function Page()", top: "28%", left: "48%", duration: 26, delay: 0.5 },
  { text: "await fetch('/api/hire')", top: "72%", left: "12%", duration: 34, delay: 2.5 },
  { text: "type Props = { id: string }", top: "12%", left: "38%", duration: 29, delay: 1.5 },
  { text: "pnpm build && pnpm start", top: "64%", left: "52%", duration: 31, delay: 0.8 },
];

/** Sub-line: each token uses a programming accent */
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

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const staggerBottom = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.14, delayChildren: 0.72 },
  },
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col overflow-hidden bg-[#000000] text-[var(--text-primary)]"
    >
      {/* Code rain canvas */}
      <div className="pointer-events-none absolute inset-0 z-[0]">
        <CodeRainCanvas />
      </div>

      {/* Technical dot grid — diagram paper */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(255,255,255,0.16) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Soft radial glows: white (UL), cyan (R), yellow (bottom) */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <div className="absolute -left-[22%] -top-[12%] h-[min(72vw,540px)] w-[min(72vw,540px)] rounded-full bg-white/[0.055] blur-[110px]" />
        <div className="absolute -right-[12%] top-[18%] h-[min(62vw,500px)] w-[min(62vw,500px)] rounded-full bg-[var(--react)]/[0.075] blur-[130px]" />
        <div className="absolute -bottom-[22%] left-[18%] h-[min(58vw,440px)] w-[min(58vw,440px)] rounded-full bg-[var(--js)]/[0.045] blur-[115px]" />
      </div>

      {/* Floating syntax — dark-editor fragments */}
      <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
        {FLOATING_SNIPPETS.map((s, i) => (
          <motion.p
            key={i}
            className="absolute max-w-[min(90vw,420px)] font-mono text-[11px] leading-relaxed md:text-xs"
            style={{
              top: s.top,
              left: s.left,
              color: "var(--text-primary)",
            }}
            animate={
              reduceMotion
                ? { opacity: 0.055 }
                : {
                    y: [0, -12, 5, 0],
                    x: [0, 5, -3, 0],
                    opacity: [0.04, 0.08, 0.055, 0.04],
                  }
            }
            transition={{
              duration: s.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: s.delay,
            }}
          >
            {s.text}
          </motion.p>
        ))}
      </div>

      {/* Hero column — offset for fixed nav + staggered motion */}
      <motion.div
        className="relative z-10 flex flex-1 flex-col justify-center px-gutter pb-28 pt-24 md:pl-[max(2rem,9vw)] md:pt-28"
        variants={stagger}
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
              className="font-mono"
              onClick={() => scrollToId("hire")}
            >
              Hire Me →
            </AccentButton>
            <AccentButton
              type="button"
              variant="ghost"
              className="font-mono"
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
                  "liquid-pill group inline-flex items-center gap-1.5 px-3 py-2 font-mono text-[11px] text-[var(--text-secondary)] transition-[box-shadow,border-color,color] duration-300",
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

      {/* Bottom: scroll cue + marquee */}
      <motion.div
        className="relative z-10 mt-auto flex flex-col gap-6 pb-8"
        initial="hidden"
        animate="show"
        variants={staggerBottom}
      >
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
            01 / SCROLL
          </span>
          <motion.div
            animate={
              reduceMotion
                ? {}
                : {
                    y: [0, 10, 0],
                  }
            }
            transition={{
              duration: 1.35,
              repeat: Infinity,
              ease: [0.45, 0, 0.55, 1],
            }}
            aria-hidden
          >
            <ChevronDown className="size-5 text-[var(--text-muted)]" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden border-t border-[var(--glass-border)]/35 py-3"
        >
          <div className="hero-marquee-track flex w-max font-mono text-[11px] text-[var(--text-muted)] md:text-xs">
            <span className="inline-block shrink-0 pr-20">{MARQUEE}</span>
            <span className="inline-block shrink-0 pr-20" aria-hidden>
              {MARQUEE}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Code Rain Canvas ─────────────────────────────────────── */
const RAIN_CHARS = "{}[]()<>=/;:.,const let async await export import";
const RAIN_COLORS = ["#f7df1e", "#61dafb", "#00add8", "#3178c6", "#ff6b9d"];

function CodeRainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const cols = Math.floor(canvas.width / 20);
    const drops: number[] = Array.from({ length: cols }, () => Math.random() * -50);

    let raf: number;
    let last = 0;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 80) return;
      last = now;

      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "13px monospace";
      for (let i = 0; i < drops.length; i++) {
        const char = RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)];
        ctx.fillStyle = RAIN_COLORS[i % RAIN_COLORS.length];
        ctx.globalAlpha = 0.06;
        ctx.fillText(char, i * 20, drops[i] * 20);
        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.5;
      }
      ctx.globalAlpha = 1;
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}

function HeroTypingQuote({ reduceMotion }: { reduceMotion: boolean | null }) {
  const [displayed, setDisplayed] = useState("");
  // Cycle quotes in order across page loads via localStorage (persists across refreshes)
  const quoteRef = useRef<string | null>(null);
  if (quoteRef.current === null) {
    // Runs once on first render — safe in client component
    const key = "yd_quote_idx";
    let prev = -1;
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) prev = parseInt(raw, 10);
    } catch { /* localStorage blocked */ }
    const next = ((isNaN(prev) ? -1 : prev) + 1) % HERO_QUOTES.length;
    try { localStorage.setItem(key, String(next)); } catch { /* ignore */ }
    quoteRef.current = HERO_QUOTES[next]!;
  }
  const quote = quoteRef.current;

  useEffect(() => {
    if (reduceMotion) {
      setDisplayed(quote);
      return;
    }

    const startDelayMs = 1650;
    const charMs = 36;
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
  }, [reduceMotion]);

  return (
    <motion.blockquote
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
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
