"use client";

import { motion } from "framer-motion";

import { getTechColor } from "@/lib/tech-colors";
import { cn } from "@/lib/utils";
import { sounds } from "@/lib/sounds";

type TechBadgeProps = {
  tech: string;
  size?: "sm" | "md";
  className?: string;
};

export function TechBadge({ tech, size = "md", className }: TechBadgeProps) {
  const color = getTechColor(tech);

  return (
    <motion.span
      data-tech-color={color}
      onMouseEnter={() => sounds.hover()}
      whileHover={{
        scale: 1.02,
        boxShadow: `0 0 20px color-mix(in srgb, ${color} 28%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 45%, var(--glass-border))`,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "font-label inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-primary)] backdrop-blur-md",
        size === "sm" && "gap-1.5 px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        className
      )}
    >
      <span
        className="inline-block size-2 shrink-0 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 10px color-mix(in srgb, ${color} 55%, transparent)`,
        }}
        aria-hidden
      />
      {tech}
    </motion.span>
  );
}
