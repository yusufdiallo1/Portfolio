import { createPublicSupabaseClient } from "@/lib/supabase";

export type CurrentBuild = {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  techStack: string[];
  status: "building" | "launching" | "shipped";
  emoji: string;
  sortOrder: number;
};

export async function fetchCurrentBuilds(): Promise<CurrentBuild[]> {
  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("current_builds")
      .select("id, title, description, progress, tech_stack, status, emoji, sort_order")
      .eq("visible", true)
      .order("sort_order", { ascending: true });
    if (error || !data?.length) return [];
    return data.map((r) => ({
      id: String(r.id),
      title: String(r.title),
      description: r.description ? String(r.description) : null,
      progress: typeof r.progress === "number" ? r.progress : 0,
      techStack: Array.isArray(r.tech_stack) ? r.tech_stack.map(String) : [],
      status: (["building", "launching", "shipped"].includes(r.status as string)
        ? r.status
        : "building") as "building" | "launching" | "shipped",
      emoji: typeof r.emoji === "string" ? r.emoji : "🔨",
      sortOrder: typeof r.sort_order === "number" ? r.sort_order : 0,
    }));
  } catch {
    return [];
  }
}
