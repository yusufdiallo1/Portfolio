"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const PHASES = ["Initializing...", "Loading stack...", "Deploying...", "Done."];

const GRADIENT =
  "linear-gradient(90deg, var(--js) 0%, var(--react) 25%, var(--go) 50%, var(--ts) 75%, var(--css) 100%)";

export function LoadingScreen() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("yd_loaded")) return;
    setShow(true);

    let i = 0;
    const phaseInterval = setInterval(() => {
      i += 1;
      setPhase(i);
      if (i >= PHASES.length - 1) clearInterval(phaseInterval);
    }, 400);

    const hideTimer = setTimeout(() => {
      setDone(true);
      setTimeout(() => {
        setShow(false);
        sessionStorage.setItem("yd_loaded", "1");
      }, 600);
    }, 1600);

    return () => {
      clearInterval(phaseInterval);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* YD monogram */}
          <motion.span
            className="font-display select-none text-white"
            style={{ fontSize: 80, lineHeight: 1 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            YD
          </motion.span>

          {/* Progress bar */}
          <div className="mt-8 h-px w-48 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{ background: GRADIENT }}
              initial={{ width: "0%" }}
              animate={{ width: done ? "100%" : "95%" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Phase text */}
          <div className="mt-4 h-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={phase}
                className="font-mono text-[11px] tracking-widest text-white/30"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {PHASES[phase]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
