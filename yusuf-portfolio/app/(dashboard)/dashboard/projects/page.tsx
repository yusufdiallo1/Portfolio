import { ProjectsTabbed } from "@/components/dashboard/projects-tabbed";
import { fetchDashboardProjects } from "@/lib/dashboard-queries";
import { createServiceClient } from "@/lib/supabase";

async function fetchBuilds() {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("current_builds")
      .select("id, title, description, progress, tech_stack, status, emoji, sort_order, visible")
      .order("sort_order", { ascending: true });
    return (data ?? []) as {
      id: string;
      title: string;
      description: string | null;
      progress: number;
      tech_stack: string[];
      status: "building" | "launching" | "shipped";
      emoji: string;
      sort_order: number;
      visible: boolean;
    }[];
  } catch {
    return [];
  }
}

export default async function DashboardProjectsPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const tab = searchParams?.tab ?? "projects";
  const [projects, builds] = await Promise.all([fetchDashboardProjects(), fetchBuilds()]);

  return <ProjectsTabbed initialProjects={projects} initialBuilds={builds} activeTab={tab} />;
}
