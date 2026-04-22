const defaultCls = "size-8 shrink-0";

export function SkillIcon({ name, className }: { name: string; className?: string }) {
  const c = className ?? defaultCls;
  switch (name) {
    case "Next.js":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 8l8 8M16 8l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "React":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <ellipse cx="12" cy="12" rx="9" ry="4" stroke="currentColor" strokeWidth="1.25" />
          <ellipse
            cx="12"
            cy="12"
            rx="9"
            ry="4"
            transform="rotate(60 12 12)"
            stroke="currentColor"
            strokeWidth="1.25"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="9"
            ry="4"
            transform="rotate(-60 12 12)"
            stroke="currentColor"
            strokeWidth="1.25"
          />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      );
    case "ClaudeCode":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3l2.2 6.8H21l-5.5 4 2.1 6.5L12 16.2 6.4 20.3l2.1-6.5L3 9.8h6.8L12 3z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Supabase":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2L4 14h6l-2 8 12-14h-6l2-8z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "TypeScript":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M8 12h3.5M8 9h8M8 15h5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      );
    case "Tailwind":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M8 10c0-2 1.5-3 5-3s5 1 5 3-1.5 3-5 3-5 1-5 3 1.5 3 5 3 5-1 5-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "Vite":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3l9 18-9-4.5L3 21 12 3z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Cursor":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 4l12 8-6 2-2 6L6 4z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Git":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="6" r="2" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.25" />
          <path d="M12 8v2l-4 8M12 10l4 8" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      );
    case "GitHub":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3c-4.3 0-8 3.5-8 8 0 3.5 2.3 6.5 5.5 7.5.4.1.4-.2.4-.4v-1.5c-2.2.5-2.7-1-2.7-1-.4-.9-1-1.2-1-1.2-.8-.5.1-.5.1-.5.9.1 1.3.9 1.3.9.8 1.2 2 1 2.5.8.1-.6.3-1.2.5-1.5-1.8-.2-3.7-.9-3.7-4 0-.9.3-1.6.9-2.2-.1-.2-.4-1 0-2.1 0 0 .7-.2 2.3.9.7-.2 1.4-.3 2.1-.3s1.4.1 2.1.3c1.6-1.1 2.3-.9 2.3-.9.4 1.1.1 1.9 0 2.1.6.6.9 1.3.9 2.2 0 3.1-1.9 3.8-3.7 4 .3.3.6.9.6 1.8v2.7c0 .2.1.5.4.4 3.2-1 5.5-4 5.5-7.5 0-4.5-3.7-8-8-8z"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "API Integration":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="7" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <rect x="14" y="7" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <path d="M10 12h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case "Web Design":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.25" />
          <path d="M3 9h18" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="6" cy="6.5" r="0.5" fill="currentColor" />
          <circle cx="8" cy="6.5" r="0.5" fill="currentColor" />
        </svg>
      );
    case "Front-end":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.25" />
          <path d="M3 9h18" stroke="currentColor" strokeWidth="1.25" />
          <path d="M12 17v3M9 20h6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case "Back-end":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="4" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <rect x="7" y="15" width="10" height="5" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <path d="M12 12v3" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      );
    case "Vercel":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3L21 19H3L12 3Z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Netlify":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2l10 10-10 10L2 12 12 2z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      );
  }
}
