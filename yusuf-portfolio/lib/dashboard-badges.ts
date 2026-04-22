import { createServiceClient } from "@/lib/supabase";

export async function getDashboardBadgeCounts(): Promise<{ unreadContacts: number; newHireRequests: number }> {
  try {
    const supabase = createServiceClient();
    const [unreadRes, hiresRes] = await Promise.all([
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("read", false),
      supabase.from("hire_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    ]);
    return {
      unreadContacts: unreadRes.count ?? 0,
      newHireRequests: hiresRes.count ?? 0,
    };
  } catch {
    return { unreadContacts: 0, newHireRequests: 0 };
  }
}
