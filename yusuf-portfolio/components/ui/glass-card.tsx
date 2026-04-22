"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  /** CSS color, e.g. `var(--react)` */
  glow?: string;
  onClick?: () => void;
  /** Disable hover scale (e.g. large forms). */
  disableHoverScale?: boolean;
};

export function GlassCard({
  children,
  className,
  glow,
  onClick,
  disableHoverScale,
}: GlassCardProps) {
  const glowStyle = glow
    ? ({
        boxShadow: `0 0 40px color-mix(in srgb, ${glow} 20%, transparent)`,
        borderColor: `color-mix(in srgb, ${glow} 35%, var(--glass-border))`,
      } as React.CSSProperties)
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        disableHoverScale
          ? undefined
          : {
              scale: 1.01,
              ...(glow
                ? {
                    borderColor: `color-mix(in srgb, ${glow} 55%, var(--glass-border-hover))`,
                    boxShadow: `0 0 48px color-mix(in srgb, ${glow} 28%, transparent)`,
                  }
                : {}),
            }
      }
      className={cn(
        "glass cursor-default transition-transform duration-200 ease-out",
        onClick && "cursor-pointer",
        className
      )}
      style={glowStyle}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
