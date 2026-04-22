"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useId, useRef } from "react";

/**
 * Faint network graph — stroke-dashoffset draws edges on scroll into view.
 */
export function SkillsNetworkBg() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const reduceMotion = useReducedMotion();
  const gid = useId();

  const paths = [
    "M10 20 Q50 5 90 25 T170 45",
    "M20 80 Q60 55 100 70 T180 60",
    "M30 50 L90 35 L150 55",
    "M15 65 Q80 90 165 75",
    "M170 25 L140 55 L175 70",
  ];

  return (
    <svg
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full text-[var(--text-muted)] opacity-[0.22]"
      viewBox="0 0 200 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${gid}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--react)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--ts)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke={`url(#${gid}-g)`}
          strokeWidth="0.35"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            reduceMotion
              ? { pathLength: 1, opacity: 0.4 }
              : {
                  pathLength: inView ? 1 : 0,
                  opacity: inView ? 0.55 : 0,
                }
          }
          transition={{
            pathLength: { duration: 1.35 + i * 0.12, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.4 },
          }}
        />
      ))}
      {[18, 52, 88, 130, 165].map((cx, i) => (
        <motion.circle
          key={`n-${i}`}
          cx={cx}
          cy={22 + (i % 3) * 22}
          r="1.2"
          fill="var(--text-muted)"
          initial={false}
          animate={{ opacity: inView ? 0.5 : 0, scale: inView ? 1 : 0.3 }}
          transition={{ delay: 0.4 + i * 0.08, duration: 0.35 }}
        />
      ))}
    </svg>
  );
}
