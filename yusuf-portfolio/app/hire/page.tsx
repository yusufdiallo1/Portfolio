"use client";

import { useEffect } from "react";

/**
 * /hire has no dedicated page — the hire form lives at /#hire.
 * This route exists so /hire never 404s or hits a broken not-found bundle.
 */
export default function HireShortcutPage() {
  useEffect(() => {
    window.location.replace("/#hire");
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6">
      <p className="font-mono text-sm text-white/55">
        Taking you to the hire section…
      </p>
    </main>
  );
}
