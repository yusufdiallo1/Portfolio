import { createServiceClient } from "@/lib/supabase";

export type DashboardProject = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  tags: string[] | null;
  featured: boolean;
  sort_order: number | null;
};

export async function fetchDashboardProjects(): Promise<DashboardProject[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, url, image_url, tags, featured, sort_order")
      .order("sort_order", { ascending: true, nullsFirst: false });
    if (error) return [];
    return (data ?? []) as DashboardProject[];
  } catch {
    return [];
  }
}

export type DashboardPricingRow = {
  id: string;
  name: string;
  price: string;
  billing_period: string;
  description: string | null;
  features: string[] | null;
  highlighted: boolean;
  sort_order: number | null;
};

export async function fetchDashboardPricing(): Promise<DashboardPricingRow[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("pricing")
      .select("id, name, price, billing_period, description, features, highlighted, sort_order")
      .order("sort_order", { ascending: true, nullsFirst: false });
    if (error) return [];
    return (data ?? []) as DashboardPricingRow[];
  } catch {
    return [];
  }
}

export type DashboardTestimonial = {
  id: string;
  author_name: string;
  author_role: string | null;
  author_avatar: string | null;
  content: string;
  rating: number | null;
  approved: boolean | null;
  created_at: string;
};

export async function fetchDashboardTestimonials(): Promise<DashboardTestimonial[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("id, author_name, author_role, author_avatar, content, rating, approved, created_at")
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as DashboardTestimonial[];
  } catch {
    return [];
  }
}

export type DashboardPageSection = {
  id: string;
  section_key: string;
  sort_order: number | null;
  visible: boolean | null;
  custom_title: string | null;
};

export async function fetchDashboardPageSections(): Promise<DashboardPageSection[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("page_sections")
      .select("id, section_key, sort_order, visible, custom_title")
      .order("sort_order", { ascending: true, nullsFirst: false });
    if (error) return [];
    return (data ?? []) as DashboardPageSection[];
  } catch {
    return [];
  }
}

export type DashboardContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  replied: boolean;
  created_at: string;
};

export async function fetchDashboardContactMessages(): Promise<DashboardContactMessage[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("id, name, email, message, read, replied, created_at")
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as DashboardContactMessage[];
  } catch {
    return [];
  }
}

export type DashboardHireRequest = {
  id: string;
  name: string;
  email: string;
  project_type: string | null;
  budget: string | null;
  timeline: string | null;
  description: string;
  tech_stack: string[] | null;
  status: string | null;
  replied: boolean;
  created_at: string;
  notes_count?: number;
};

export async function fetchDashboardHireRequests(): Promise<DashboardHireRequest[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("hire_requests")
      .select("id, name, email, project_type, budget, timeline, description, tech_stack, status, replied, created_at, client_notes(count)")
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []).map((row: Record<string, unknown>) => {
      const { client_notes, ...rest } = row;
      return {
        ...rest,
        notes_count: Array.isArray(client_notes) ? (client_notes[0] as { count: number } | undefined)?.count ?? 0 : 0,
      };
    }) as unknown as DashboardHireRequest[];
  } catch {
    return [];
  }
}

export type ClientNote = {
  id: string;
  hire_request_id: string;
  note: string;
  created_at: string;
};

export async function fetchClientNotes(hireRequestId: string): Promise<ClientNote[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("client_notes")
      .select("id, hire_request_id, note, created_at")
      .eq("hire_request_id", hireRequestId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as ClientNote[];
  } catch {
    return [];
  }
}

export type RevenueEntry = {
  id: string;
  client_name: string;
  project_title: string;
  project_type: string | null;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "refunded";
  hire_request_id: string | null;
  completed_at: string;
  notes: string | null;
  created_at: string;
};

export async function fetchRevenueEntries(): Promise<RevenueEntry[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("revenue_entries")
      .select("id, client_name, project_title, project_type, amount, currency, status, hire_request_id, completed_at, notes, created_at")
      .order("completed_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as RevenueEntry[];
  } catch {
    return [];
  }
}

export type DashboardReferral = {
  id: string;
  referrer_name: string;
  referrer_email: string;
  referred_name: string;
  referred_email: string;
  message: string | null;
  status: string;
  reward_amount: string | null;
  created_at: string;
};

export async function fetchDashboardReferrals(): Promise<DashboardReferral[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("referrals")
      .select("id, referrer_name, referrer_email, referred_name, referred_email, message, status, reward_amount, created_at")
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as DashboardReferral[];
  } catch {
    return [];
  }
}
