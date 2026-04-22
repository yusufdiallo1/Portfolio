"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const BRAND_TEXT = "YusufCreates";

export function NavBrandTyping({ reduceMotion }: { reduceMotion: boolean | null }) {
  const [displayed, setDisplayed] = useState("");
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      router.push("/login");
    }
  };

  useEffect(() => {
    if (reduceMotion) {
      setDisplayed(BRAND_TEXT);
      return;
    }

    const startDelayMs = 400;
    const charMs = 42;
    let intervalId: number | undefined;

    const startTimer = window.setTimeout(() => {
      let i = 0;
      intervalId = window.setInterval(() => {
        i += 1;
        setDisplayed(BRAND_TEXT.slice(0, i));
        if (i >= BRAND_TEXT.length && intervalId !== undefined) {
          window.clearInterval(intervalId);
          intervalId = undefined;
        }
      }, charMs);
    }, startDelayMs);

    return () => {
      window.clearTimeout(startTimer);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [reduceMotion]);

  return (
    <Link
      href="#hero"
      onClick={handleLogoClick}
      className={cn(
        "liquid-pill font-mono inline-flex min-w-[12rem] items-center gap-0.5 px-3 py-1.5 text-sm text-white transition-[box-shadow] duration-300",
        "hover:shadow-[0_0_28px_rgba(255,255,255,0.08)]"
      )}
      aria-label="YusufCreates — home"
    >
      <span>{displayed}</span>
      <span
        className="hero-cursor inline-block h-[1em] w-px shrink-0 bg-white align-middle"
        aria-hidden
      />
    </Link>
  );
}
