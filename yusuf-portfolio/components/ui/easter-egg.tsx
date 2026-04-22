"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { sounds } from "@/lib/sounds";
import { TechBadge } from "@/components/ui/tech-badge";

const PARTICLES = [
  "React", "Next.js", "TypeScript", "Supabase", "Tailwind", 
  "ClaudeCode", "Cursor", "GSAP", "Three.js", "Framer",
  "Node.js", "Go", "Vercel", "Git", "API", "Rust",
  "Python", "HTML", "CSS", "JS"
];

export function EasterEgg() {
  const [active, setActive] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "Y") {
        if (localStorage.getItem("easter_egg_found")) return;
        trigger();
      }
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const trigger = () => {
    setActive(true);
    sounds.success();
    track("easter_egg_found", {});
    localStorage.setItem("easter_egg_found", "true");
    
    setTimeout(() => {
      setShowContent(true);
    }, 600);

    setTimeout(close, 6000);
  };

  const close = () => {
    setActive(false);
    setShowContent(false);
  };

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-xl cursor-pointer"
        >
          <div className="relative h-full w-full flex items-center justify-center">
            {/* Center Star */}
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={showContent ? { scale: 0, opacity: 0 } : { scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-[200px] text-[var(--react)] select-none"
            >
              ✦
            </motion.span>

            {/* Exploding Particles */}
            {showContent && PARTICLES.map((tech, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{ 
                  x: (Math.random() - 0.5) * window.innerWidth * 0.8,
                  y: (Math.random() - 0.5) * window.innerHeight * 0.8,
                  opacity: 0.8,
                  scale: 0.9,
                  rotate: Math.random() * 360
                }}
                transition={{ type: "spring", stiffness: 50, damping: 20, delay: i * 0.02 }}
                className="absolute"
              >
                <TechBadge tech={tech} size="sm" />
              </motion.div>
            ))}

            {/* Secret Content */}
            {showContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center z-10 p-6 max-w-lg"
              >
                <h2 className="font-display text-5xl text-white mb-4">You found the secret.</h2>
                <p className="font-mono text-[var(--text-secondary)] mb-8">
                  Yusuf builds fast. You explore faster.
                </p>
                <div className="bg-white/5 border border-[var(--js)]/30 rounded-xl p-6 backdrop-blur-md">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">
                    Access Code
                  </p>
                  <p className="font-mono text-3xl text-[var(--js)] font-bold mb-2">
                    YD-EXPLORER-10
                  </p>
                  <p className="font-mono text-xs text-[var(--text-secondary)]">
                    10% off your first project. Mention this code.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
