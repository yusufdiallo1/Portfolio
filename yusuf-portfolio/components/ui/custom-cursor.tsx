"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

// SVG arrow cursor path — same shape as the OS default pointer
const CURSOR_PATH =
  "M4 2L4 17L7.5 13.5L10.5 20L12.5 19L9.5 12.5L14 12.5L4 2Z";

export function CustomCursor() {
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);
  const [visible, setVisible] = useState(false);
  const [hasFinePointer, setHasFinePointer] = useState(false);

  // Tight spring — snappy but smooth, not laggy
  const x = useSpring(mouseX, { stiffness: 280, damping: 28, mass: 0.35 });
  const y = useSpring(mouseY, { stiffness: 280, damping: 28, mass: 0.35 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setHasFinePointer(mq.matches);
    const handler = (e: MediaQueryListEvent) => setHasFinePointer(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!hasFinePointer) return;

    document.body.setAttribute("data-portfolio-cursor", "");

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      document.body.removeAttribute("data-portfolio-cursor");
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [mouseX, mouseY, hasFinePointer]);

  if (!hasFinePointer) return null;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
      style={{ x, y }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.12 }}
    >
      <svg
        width="20"
        height="22"
        viewBox="0 0 16 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 0 6px rgba(97,218,251,0.5))" }}
      >
        {/* Colored fill — react cyan tint */}
        <path
          d={CURSOR_PATH}
          fill="#61dafb"
          fillOpacity={0.92}
        />
        {/* Crisp dark outline for contrast on any background */}
        <path
          d={CURSOR_PATH}
          stroke="#000"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
