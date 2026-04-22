"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Fragment, useEffect, useState } from "react";
import { X, Menu } from "lucide-react";

import { useContactModal } from "@/components/portfolio/contact-modal";
import { NavBrandTyping } from "@/components/portfolio/nav-brand-typing";
import { AccentButton } from "@/components/ui/accent-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "about", label: "About", color: "var(--rust)" },
  { id: "skills", label: "Skills", color: "var(--ts)" },
  { id: "projects", label: "Projects", color: "var(--react)" },
  { id: "pricing", label: "Pricing", color: "var(--python)" },
  { id: "hire", label: "Hire", color: "var(--go)" },
  { id: "testimonials", label: "Testimonials", color: "var(--js)" },
  { id: "faq", label: "FAQ", color: "var(--css)" },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type PortfolioNavProps = {
  /** Pixels to offset the fixed header below the availability banner (e.g. 36). */
  bannerOffsetPx?: number;
};

export function PortfolioNav({ bannerOffsetPx = 0 }: PortfolioNavProps) {
  const { open: openContact } = useContactModal();
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = NAV.map((n) => n.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Close menu on scroll
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [menuOpen]);

  const navBar = scrolled
    ? "border-[var(--glass-border)] bg-black/58 shadow-[0_12px_48px_rgba(0,0,0,0.55)] backdrop-blur-2xl backdrop-saturate-[1.65]"
    : "border-transparent bg-black/30 backdrop-blur-xl backdrop-saturate-150";

  return (
    <>
      <header
        style={{ top: bannerOffsetPx }}
        className={cn(
          "fixed left-0 right-0 z-[200] border-b transition-[background,box-shadow,border-color,backdrop-filter] duration-300",
          navBar
        )}
      >
        <div className="mx-auto grid w-full max-w-wide grid-cols-1 items-center gap-4 px-gutter py-3.5 md:grid-cols-[1fr_auto_1fr] md:py-4">
          <div className="flex items-center justify-between md:justify-start">
            <NavBrandTyping reduceMotion={reduceMotion} />

            {/* Mobile: hamburger */}
            <div className="flex items-center gap-3 md:hidden">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                className="flex size-8 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:text-white"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Desktop nav pill */}
          <nav
            className="liquid-pill mx-auto hidden max-w-full items-center gap-0 overflow-x-auto px-2 py-1.5 font-mono md:flex md:max-w-none md:gap-0 md:px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Section navigation"
          >
            {NAV.map((item, index) => {
              const active = activeSection === item.id;
              return (
                <Fragment key={item.id}>
                  {index > 0 && (
                    <span
                      className="hidden select-none px-0.5 text-[var(--text-muted)] md:inline"
                      aria-hidden
                    >
                      ·
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      scrollToId(item.id);
                      sounds.click();
                    }}
                    onMouseEnter={() => sounds.hover()}
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1.5 text-xs transition-colors md:px-3 md:text-[13px]",
                      active
                        ? "font-medium"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                    style={active ? { color: item.color } : undefined}
                  >
                    {item.label}
                  </button>
                </Fragment>
              );
            })}
          </nav>

          <div className="hidden justify-end items-center gap-4 md:flex">
            <SoundToggle />
            <ThemeToggle />
            <AccentButton
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 border-0 bg-transparent font-mono shadow-none backdrop-blur-md"
              onClick={openContact}
            >
              Contact
            </AccentButton>
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[199] flex flex-col items-end bg-black/90 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <nav className="flex h-full w-full flex-col justify-center gap-2 px-10 pt-24">
              <div className="mb-8 flex justify-between items-center">
                <SoundToggle />
              </div>
              {NAV.map((item, i) => (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 28 }}
                  onClick={() => {
                    setMenuOpen(false);
                    sounds.click();
                    setTimeout(() => scrollToId(item.id), 200);
                  }}
                  onMouseEnter={() => sounds.hover()}
                  className="font-display text-left text-4xl font-normal tracking-tight text-[var(--text-secondary)] transition-colors hover:text-white active:scale-95"
                  style={activeSection === item.id ? { color: item.color } : undefined}
                >
                  {item.label}
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
