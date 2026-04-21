import { createServiceClient } from "@/lib/supabase";

/** True if at least one row exists in admin_credentials (service role). */
export async function hasAdminCredentials(): Promise<boolean> {
  try {
    const supabase = createServiceClient();
    const { count, error } = await supabase
      .from("admin_credentials")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("[hasAdminCredentials]", error.message);
      return false;
    }
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}
