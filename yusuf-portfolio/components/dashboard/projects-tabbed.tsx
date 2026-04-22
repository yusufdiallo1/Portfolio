"use client";

import Link from "next/link";

import { BuildsManager } from "@/components/dashboard/builds-manager";
import { ProjectsManager } from "@/components/dashboard/projects-manager";
import type { DashboardProject } from "@/lib/dashboard-queries";
import { cn } from "@/lib/utils";

type Build = {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  tech_stack: string[];
  status: "building" | "launching" | "shipped";
  emoji: string;
  sort_order: number;
  visible: boolean;
};

const TABS = [
  { key: "projects", label: "Projects" },
  { key: "builds", label: "Currently Building" },
] as const;

export function ProjectsTabbed({
  initialProjects,
  initialBuilds,
  activeTab,
}: {
  initialProjects: DashboardProject[];
  initialBuilds: Build[];
  activeTab: string;
}) {
  const tab = TABS.find((t) => t.key === activeTab)?.key ?? "projects";

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border border-[var(--glass-border)] bg-black/30 p-1 w-fit">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/projects?tab=${t.key}`}
            className={cn(
              "rounded-md px-4 py-1.5 font-label text-sm transition-colors",
              tab === t.key
                ? "bg-white/10 text-white"
                : "text-[var(--text-muted)] hover:text-white"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "projects" && <ProjectsManager initialProjects={initialProjects} />}
      {tab === "builds" && <BuildsManager initialBuilds={initialBuilds} />}
    </div>
  );
}
