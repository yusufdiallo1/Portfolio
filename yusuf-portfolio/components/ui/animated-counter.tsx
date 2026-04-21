"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type AnimatedCounterProps = {
  target: number;
  className?: string;
  suffix?: string;
  integer?: boolean;
};

export function AnimatedCounter({
  target,
  className,
  suffix = "",
  integer = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      type: "spring",
      stiffness: 90,
      damping: 18,
      mass: 0.8,
      onUpdate: (v) => setValue(integer ? Math.round(v) : v),
    });
    return () => controls.stop();
  }, [inView, target, integer]);

  return (
    <span ref={ref} className={className}>
      {integer ? Math.round(value) : value}
      {suffix}
    </span>
  );
}
