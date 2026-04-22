import { createServiceClient } from "@/lib/supabase";

export type ActivityPoint = { date: string; page_views: number; ai_chats: number };
export type HireTypeSlice = { name: string; value: number; fill: string };

export type RecentContact = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  read: boolean;
};

export type RecentHire = {
  id: string;
  name: string;
  email: string;
  project_type: string;
  budget: string;
  status: string;
  created_at: string;
};

function startOfDayUtc(d: Date) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function fmtDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

const TYPE_COLORS = ["var(--react)", "var(--go)", "var(--js)", "var(--ts)", "var(--python)", "var(--css)"];

export async function fetchDashboardOverview() {
  const empty = {
    pageViews30: 0,
    pageViewsPrev30: 0,
    aiChats30: 0,
    contactOpens30: 0,
    contactsTotal: 0,
    contactsUnread: 0,
    hireTotal: 0,
    hireNew: 0,
    projectsTotal: 0,
    activitySeries: [] as ActivityPoint[],
    hireByType: [] as HireTypeSlice[],
    recentContacts: [] as RecentContact[],
    recentHires: [] as RecentHire[],
  };

  try {
    const supabase = createServiceClient();
    const now = new Date();
    const cut30 = new Date(now);
    cut30.setUTCDate(cut30.getUTCDate() - 30);
    const cut60 = new Date(now);
    cut60.setUTCDate(cut60.getUTCDate() - 60);

    const { data: events } = await supabase
      .from("analytics_events")
      .select("event_name, created_at")
      .gte("created_at", cut60.toISOString());

    const ev = events ?? [];
    const start30 = startOfDayUtc(cut30);
    const start60 = startOfDayUtc(cut60);
    const mid = startOfDayUtc(cut30);

    const inR = (iso: string, a: Date, b: Date) => {
      const t = new Date(iso).getTime();
      return t >= a.getTime() && t < b.getTime();
    };

    let pageViews30 = 0;
    let pageViewsPrev30 = 0;
    let aiChats30 = 0;
    let contactOpens30 = 0;

    for (const e of ev) {
      const t = e.created_at as string;
      const name = String(e.event_name ?? "");
      if (inR(t, start30, now)) {
        if (name === "page_view") pageViews30 += 1;
        if (name === "ai_chat") aiChats30 += 1;
        if (name === "contact_open") contactOpens30 += 1;
      } else if (inR(t, start60, mid)) {
        if (name === "page_view") pageViewsPrev30 += 1;
      }
    }

    const dayMap = new Map<string, { pv: number; ac: number }>();
    for (let i = 29; i >= 0; i--) {
      const day = new Date(now);
      day.setUTCDate(day.getUTCDate() - i);
      dayMap.set(fmtDay(day), { pv: 0, ac: 0 });
    }
    for (const e of ev) {
      const name = String(e.event_name ?? "");
      const t = e.created_at as string;
      if (!inR(t, start30, now)) continue;
      const key = fmtDay(new Date(t));
      if (!dayMap.has(key)) continue;
      const cur = dayMap.get(key)!;
      if (name === "page_view") cur.pv += 1;
      if (name === "ai_chat") cur.ac += 1;
    }
    const activitySeries: ActivityPoint[] = Array.from(dayMap.entries()).map(([date, v]) => ({
      date,
      page_views: v.pv,
      ai_chats: v.ac,
    }));

    const [
      { count: contactsTotal },
      { count: contactsUnread },
      { count: hireTotal },
      { count: hireNew },
      { count: projectsTotal },
      typeRes,
      recentC,
      recentH,
    ] = await Promise.all([
      supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("read", false),
      supabase.from("hire_requests").select("id", { count: "exact", head: true }),
      supabase.from("hire_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("hire_requests").select("project_type"),
      supabase
        .from("contact_messages")
        .select("id, name, email, created_at, read")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("hire_requests")
        .select("id, name, email, project_type, budget, status, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    const typeCounts = new Map<string, number>();
    for (const row of typeRes.data ?? []) {
      const pt = String((row as { project_type?: string }).project_type ?? "other");
      typeCounts.set(pt, (typeCounts.get(pt) ?? 0) + 1);
    }
    const hireByType: HireTypeSlice[] = Array.from(typeCounts.entries()).map(([name, value], i) => ({
      name,
      value,
      fill: TYPE_COLORS[i % TYPE_COLORS.length],
    }));

    return {
      pageViews30,
      pageViewsPrev30,
      aiChats30,
      contactOpens30,
      contactsTotal: contactsTotal ?? 0,
      contactsUnread: contactsUnread ?? 0,
      hireTotal: hireTotal ?? 0,
      hireNew: hireNew ?? 0,
      projectsTotal: projectsTotal ?? 0,
      activitySeries,
      hireByType,
      recentContacts: (recentC.data ?? []) as RecentContact[],
      recentHires: (recentH.data ?? []) as RecentHire[],
    };
  } catch (e) {
    console.error("[fetchDashboardOverview]", e);
    return empty;
  }
}

export type DashboardOverviewData = Awaited<ReturnType<typeof fetchDashboardOverview>>;
