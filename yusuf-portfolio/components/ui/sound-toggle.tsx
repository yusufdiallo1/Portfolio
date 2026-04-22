"use client";

import { useEffect, useState } from "react";
import { sounds } from "@/lib/sounds";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(sounds.isEnabled());
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    sounds.setEnabled(next);
  };

  return (
    <button
      onClick={toggle}
      className="flex h-9 items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 font-mono text-[10px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--glass-bg-hover)]"
      aria-label="Toggle sound effects"
    >
      <span>{enabled ? "🔊" : "🔇"}</span>
      <span className="hidden sm:inline">Sound</span>
    </button>
  );
}
