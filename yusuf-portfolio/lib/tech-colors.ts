/** Design-system accent for portfolio tech names (tags, gradients, borders). */
export const TECH_COLORS: Record<string, string> = {
  React: "var(--react)",
  "Next.js": "var(--ts)",
  TypeScript: "var(--ts)",
  JavaScript: "var(--js)",
  Supabase: "var(--go)",
  Tailwind: "var(--react)",
  CSS: "var(--css)",
  Python: "var(--python)",
  Go: "var(--go)",
  Rust: "var(--rust)",
  HTML: "var(--html)",
  ClaudeCode: "var(--react)",
  Cursor: "var(--html)",
  Vite: "var(--css)",
  Git: "var(--rust)",
  GitHub: "var(--text-secondary)",
  AI: "var(--python)",
  Design: "var(--css)",
  Lovable: "var(--react)",
  "API Integration": "var(--go)",
  "Web Design": "var(--css)",
  "Front-end": "var(--js)",
  "Back-end": "var(--go)",
  Vercel: "var(--text-primary)",
  Netlify: "var(--go)",
  Other: "var(--text-secondary)",
};

export function getTechColor(name: string): string {
  return TECH_COLORS[name] ?? "var(--text-secondary)";
}
