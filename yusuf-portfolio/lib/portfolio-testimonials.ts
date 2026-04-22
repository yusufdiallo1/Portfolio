import { createPublicSupabaseClient } from "@/lib/supabase";

export type PortfolioTestimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatarUrl: string | null;
  rating: number;
};

function mapRow(row: Record<string, unknown>): PortfolioTestimonial | null {
  const name = row.name;
  const role = row.role;
  const quote = row.quote;
  if (typeof name !== "string" || typeof role !== "string" || typeof quote !== "string") {
    return null;
  }
  const id = typeof row.id === "string" ? row.id : String(row.id ?? quote.slice(0, 12));
  const avatarUrl =
    row.avatar_url === null || row.avatar_url === undefined
      ? null
      : typeof row.avatar_url === "string"
        ? row.avatar_url
        : null;
  let rating = typeof row.rating === "number" ? row.rating : 5;
  if (rating < 1) rating = 1;
  if (rating > 5) rating = 5;

  return { id, name, role, quote, avatarUrl, rating };
}

/**
 * Approved testimonials only. Never throws — returns [] on error.
 */
export async function fetchPortfolioTestimonials(): Promise<PortfolioTestimonial[]> {
  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("testimonials")
      .select("id, name, role, quote, avatar_url, rating, approved, sort_order")
      .eq("approved", true)
      .order("sort_order", { ascending: true, nullsFirst: false });

    if (error || !data?.length) return [];

    const mapped = data
      .map((row) => mapRow(row as Record<string, unknown>))
      .filter((t): t is PortfolioTestimonial => Boolean(t));

    return mapped;
  } catch {
    return [];
  }
}
