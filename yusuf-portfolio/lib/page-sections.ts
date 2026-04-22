import { createPublicSupabaseClient } from "@/lib/supabase";

export type PageSectionRow = {
  section_key: string;
  sort_order: number;
  visible: boolean;
};

/** Default order when `page_sections` is missing or empty. */
export const DEFAULT_PAGE_SECTIONS: PageSectionRow[] = [
  { section_key: "hero", sort_order: 0, visible: true },
  { section_key: "about", sort_order: 1, visible: true },
  { section_key: "skills", sort_order: 2, visible: true },
  { section_key: "projects", sort_order: 3, visible: true },
  { section_key: "pricing", sort_order: 4, visible: true },
  { section_key: "hire", sort_order: 5, visible: true },
  { section_key: "testimonials", sort_order: 6, visible: true },
  { section_key: "faq", sort_order: 7, visible: true },
];

const ALLOWED_KEYS = new Set(DEFAULT_PAGE_SECTIONS.map((s) => s.section_key));

export function isAllowedSectionKey(key: string): key is (typeof DEFAULT_PAGE_SECTIONS)[number]["section_key"] {
  return ALLOWED_KEYS.has(key);
}

/**
 * Visible sections in order. Never throws — falls back to defaults.
 */
export async function fetchPageSections(): Promise<PageSectionRow[]> {
  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return DEFAULT_PAGE_SECTIONS;

    const { data, error } = await supabase
      .from("page_sections")
      .select("section_key, sort_order, visible")
      .eq("visible", true)
      .order("sort_order", { ascending: true, nullsFirst: false });

    if (error || !data?.length) return DEFAULT_PAGE_SECTIONS;

    const rows = data
      .filter((row): row is PageSectionRow => {
        const key = row.section_key;
        return typeof key === "string" && ALLOWED_KEYS.has(key) && row.visible === true;
      })
      .map((row) => ({
        section_key: row.section_key as string,
        sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
        visible: true,
      }))
      .sort((a, b) => a.sort_order - b.sort_order);

    return rows.length ? rows : DEFAULT_PAGE_SECTIONS;
  } catch {
    return DEFAULT_PAGE_SECTIONS;
  }
}
