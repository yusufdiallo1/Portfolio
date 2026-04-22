import { NewsletterManager } from "@/components/dashboard/newsletter-manager";
import { createServiceClient } from "@/lib/supabase";

async function fetchSubscribers() {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, name, confirmed, created_at")
      .order("created_at", { ascending: false });
    return (data ?? []) as {
      id: string;
      email: string;
      name: string | null;
      confirmed: boolean;
      created_at: string;
    }[];
  } catch {
    return [];
  }
}

export default async function NewsletterPage() {
  const subscribers = await fetchSubscribers();
  return <NewsletterManager initialSubscribers={subscribers} />;
}
