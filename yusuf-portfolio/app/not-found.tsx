"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const TECH_COLORS = ["#f7df1e", "#61dafb", "#00add8", "#3178c6", "#ff6b9d", "#ff4500", "#3776ab"];

function ColorCyclingText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block" }}
          animate={{
            color: TECH_COLORS,
          }}
          transition={{
            duration: TECH_COLORS.length * 0.7,
            repeat: Infinity,
            delay: i * 0.18,
            ease: "linear",
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--react)]/5 blur-[100px]" />
        <div className="absolute left-1/4 top-2/3 h-64 w-64 rounded-full bg-[var(--ts)]/5 blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <ColorCyclingText
            text="404"
            className="font-display block font-normal leading-none tracking-tight"
            aria-hidden
          />
          <style>{`.font-display { font-family: var(--font-display, Georgia, serif); font-size: clamp(7rem, 20vw, 14rem); }`}</style>
        </motion.div>

        <motion.p
          className="font-mono text-sm text-[var(--text-muted)] md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          You&apos;ve entered the void.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 font-mono text-sm text-[var(--text-primary)] backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-200 hover:border-white/25 hover:bg-[var(--glass-bg-hover)] hover:shadow-[0_0_24px_rgba(255,255,255,0.06)]"
          >
            ← Return to base
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
