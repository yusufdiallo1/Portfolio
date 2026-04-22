import { z } from "zod";

export const projectTypes = [
  { value: "landing_page", label: "Landing Page" },
  { value: "web_app", label: "Web App" },
  { value: "full_stack_saas", label: "Full Stack SaaS" },
  { value: "api_integration", label: "API Integration" },
  { value: "other", label: "Other" },
] as const;

export const budgets = [
  { value: "under_500", label: "Under $500" },
  { value: "500_1500", label: "$500–$1,500" },
  { value: "1500_3000", label: "$1,500–$3,000" },
  { value: "3000_plus", label: "$3,000+" },
] as const;

export const timelines = [
  { value: "asap", label: "ASAP" },
  { value: "1_week", label: "1 week" },
  { value: "2_weeks", label: "2 weeks" },
  { value: "1_month", label: "1 month" },
  { value: "flexible", label: "Flexible" },
] as const;

export const techPillOptions = [
  "React",
  "Next.js",
  "TypeScript",
  "Supabase",
  "Tailwind",
  "Vercel",
  "Netlify",
  "AI Integration",
  "Payments",
  "Auth",
  "Other",
] as const;

export const deployTargets = [
  { value: "vercel", label: "Vercel" },
  { value: "netlify", label: "Netlify" },
  { value: "cloudflare", label: "Cloudflare Pages" },
  { value: "aws", label: "AWS / other cloud" },
  { value: "self_hosted", label: "Self-hosted" },
  { value: "undecided", label: "Not sure yet" },
] as const;

export const themePreferences = [
  { value: "dark", label: "Dark UI" },
  { value: "light", label: "Light UI" },
  { value: "system", label: "System preference" },
  { value: "high_contrast", label: "High contrast" },
] as const;

/** Accent / palette directions clients can pick (multi-select). */
export const colorAccentOptions = [
  "React cyan",
  "TypeScript blue",
  "JavaScript yellow",
  "Emerald",
  "Violet",
  "Monochrome",
  "Brand colors (from logo)",
  "Surprise me",
] as const;

export const hireFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  projectType: z.enum(
    ["landing_page", "web_app", "full_stack_saas", "api_integration", "other"],
    { message: "Choose a project type" }
  ),
  budget: z.enum(["under_500", "500_1500", "1500_3000", "3000_plus"], {
    message: "Choose a budget range",
  }),
  timeline: z.enum(["asap", "1_week", "2_weeks", "1_month", "flexible"], {
    message: "Choose a timeline",
  }),
  techPreferences: z.array(z.string()).min(1, "Select at least one tech preference"),
  deployTarget: z.enum(
    ["vercel", "netlify", "cloudflare", "aws", "self_hosted", "undecided"],
    { message: "Choose where you want to deploy" }
  ),
  themePreference: z.enum(["dark", "light", "system", "high_contrast"], {
    message: "Choose a UI theme direction",
  }),
  colorAccents: z
    .array(z.string())
    .min(1, "Pick at least one color / palette direction"),
  description: z.string().min(20, "Describe your project in at least 20 characters"),
});

export type HireFormValues = z.infer<typeof hireFormSchema>;
