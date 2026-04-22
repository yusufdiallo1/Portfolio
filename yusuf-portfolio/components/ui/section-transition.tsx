"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

type SectionTransitionProps = {
  children: React.ReactNode;
  index?: number;
  className?: string;
  color?: string;
};

export function SectionTransition({
  children,
  index,
  className,
  color = "rgba(255,255,255,0.4)",
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduceMotion = useReducedMotion();

  const num = index !== undefined ? String(index + 1).padStart(2, "0") : null;

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      {/* Glowing section divider */}
      <motion.div
        className="relative mb-0 h-px w-full overflow-visible"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="h-px w-full bg-[var(--glass-border)]/30" />
        <motion.div
          className="absolute left-1/2 top-0 h-px -translate-x-1/2 rounded-full"
          style={{ background: color, filter: `blur(3px)` }}
          initial={{ width: 0, opacity: 0 }}
          animate={inView ? { width: 120, opacity: [0, 1, 0.6] } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>

      {/* Fixed left section index */}
      {num && (
        <motion.span
          className="pointer-events-none fixed left-4 top-1/2 -translate-y-1/2 font-mono text-[10px] tracking-[0.22em] text-[var(--text-muted)] [writing-mode:vertical-rl] md:left-6"
          style={{ zIndex: 50 }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {num}
        </motion.span>
      )}

      {/* Fade + slide up */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
