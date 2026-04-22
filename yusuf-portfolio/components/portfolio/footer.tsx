import { cn } from "@/lib/utils";

const social = {
  linkedin: "https://www.linkedin.com/in/yusufdiallo11/",
  instagram: "https://www.instagram.com/build.withyusuf",
};

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.5 8.7v12H2.2V8.7h4.3zM4.4 3.2c1.4 0 2.3.9 2.3 2.1S5.7 7.4 4.4 7.4c-1.4 0-2.3-.9-2.3-2.1s.9-2.1 2.3-2.1zm15.1 9.3v8.2h-4.3v-7.6c0-1.9-.7-3.2-2.4-3.2-1.3 0-2.1.9-2.4 1.7-.1.3-.1.7-.1 1.1v8h-4.3V8.7h4.1v1.8h.1c.6-.9 1.7-2.1 4.2-2.1 3.1 0 5.4 2 5.4 6.4z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#pricing", label: "Pricing" },
  { href: "#hire", label: "Hire" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
  { href: "/refer", label: "Refer a Friend" },
] as const;

export function Footer() {
  return (
    <footer
      id="footer"
      className="relative border-t border-[var(--glass-border)] bg-black/50 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-wide px-gutter py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1fr_auto_1fr] md:items-start md:gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--glass-border)] bg-white/[0.04] font-label text-sm font-semibold text-white">
                YD
              </span>
            </div>
            <p className="max-w-xs font-mono text-sm text-[var(--text-muted)]">
              Building the web, fast.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-5 gap-y-2 md:justify-center">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-mono text-xs text-[var(--text-muted)] transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex justify-start gap-3 md:justify-end">
            <a
              href={social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border border-[var(--glass-border)]",
                "text-[var(--text-secondary)] transition-[color,background,border-color] hover:border-[var(--glass-border-hover)] hover:text-white"
              )}
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="h-[18px] w-[18px]" />
            </a>
            <a
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border border-[var(--glass-border)]",
                "text-[var(--text-secondary)] transition-[color,background,border-color] hover:border-[var(--glass-border-hover)] hover:text-white"
              )}
              aria-label="Instagram"
            >
              <InstagramIcon className="h-[18px] w-[18px]" />
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--glass-border)]/50 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="font-label text-[11px] tracking-tight text-[var(--text-muted)] opacity-75">
            © {new Date().getFullYear()} Yusuf Diallo
          </p>
          <p className="font-label text-[11px] text-[var(--text-muted)]">
            Built with{" "}
            <span className="text-[var(--ts)]">Next.js</span>
            {" · "}
            <span className="text-[var(--react)]">Tailwind</span>
            {" · "}
            <span className="text-[var(--go)]">Supabase</span>
            {" · "}
            <span className="text-[var(--python)]">Llama</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
