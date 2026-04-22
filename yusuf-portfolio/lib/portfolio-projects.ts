import { createPublicSupabaseClient } from "@/lib/supabase";

export type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  tags: string[];
};

/** Local thumbnails when CMS has no image_url (matches project URL). */
const DEFAULT_IMAGE_BY_URL: Record<string, string> = {
  "https://thecuratedroute.us": "/projects/curated-route.png",
  "https://noteley.lovable.app": "/projects/noteley.png",
  "https://firststepfinder.lovable.app": "/projects/first-step-finder.png",
};

function withDefaultImage(project: PortfolioProject): PortfolioProject {
  if (project.imageUrl) return project;
  const key = project.url.replace(/\/$/, "");
  const fallback = DEFAULT_IMAGE_BY_URL[key] ?? DEFAULT_IMAGE_BY_URL[project.url];
  return fallback ? { ...project, imageUrl: fallback } : project;
}

const FALLBACK: PortfolioProject[] = [
  {
    id: "fallback-1",
    title: "The Curated Route",
    description: "A curated travel discovery platform",
    url: "https://thecuratedroute.us",
    imageUrl: "/projects/curated-route.png",
    tags: ["Next.js", "Supabase", "Design"],
  },
  {
    id: "fallback-2",
    title: "Noteley",
    description: "AI-powered notes app",
    url: "https://noteley.lovable.app",
    imageUrl: "/projects/noteley.png",
    tags: ["React", "AI", "TypeScript"],
  },
  {
    id: "fallback-3",
    title: "First Step Finder",
    description: "Goal discovery tool",
    url: "https://firststepfinder.lovable.app",
    imageUrl: "/projects/first-step-finder.png",
    tags: ["React", "AI", "Lovable"],
  },
];

function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function mapRow(row: Record<string, unknown>): PortfolioProject | null {
  const title = row.title;
  const url = row.url;
  if (typeof title !== "string" || typeof url !== "string") return null;
  const id = typeof row.id === "string" ? row.id : url;
  const description =
    typeof row.description === "string" ? row.description : "";
  const imageUrl =
    row.image_url === null || row.image_url === undefined
      ? null
      : typeof row.image_url === "string"
        ? row.image_url
        : null;
  return {
    id,
    title,
    description,
    url,
    imageUrl,
    tags: normalizeTags(row.tags),
  };
}

/**
 * Featured projects first, then sort_order ascending.
 * Falls back to static list if the table is missing, empty, or RLS blocks reads.
 */
export async function fetchPortfolioProjects(): Promise<PortfolioProject[]> {
  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return FALLBACK.map(withDefaultImage);
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, url, image_url, tags, featured, sort_order")
      .order("featured", { ascending: false, nullsFirst: false })
      .order("sort_order", { ascending: true, nullsFirst: false });

    if (error) return FALLBACK.map(withDefaultImage);
    if (!data?.length) return FALLBACK.map(withDefaultImage);

    const mapped = data
      .map((row) => mapRow(row as Record<string, unknown>))
      .filter((p): p is PortfolioProject => Boolean(p))
      .map(withDefaultImage);

    return mapped.length ? mapped : FALLBACK.map(withDefaultImage);
  } catch {
    return FALLBACK.map(withDefaultImage);
  }
}
