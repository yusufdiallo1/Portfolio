"use client";

import {
  Briefcase,
  CreditCard,
  DollarSign,
  ExternalLink,
  FolderOpen,
  Gift,
  LayoutDashboard,
  Layers,
  LogOut,
  Mail,
  Settings,
  Star,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";

import { AccentButton } from "@/components/ui/accent-button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, match: "exact" as const },
  { href: "/dashboard/projects", label: "Projects", icon: FolderOpen, match: "prefix" as const },
  { href: "/dashboard/newsletter", label: "Newsletter", icon: Mail, match: "prefix" as const },
  { href: "/dashboard/revenue", label: "Revenue", icon: DollarSign, match: "prefix" as const },
  { href: "/dashboard/referrals", label: "Referrals", icon: Gift, match: "prefix" as const },
  { href: "/dashboard/pricing", label: "Pricing", icon: CreditCard, match: "prefix" as const },
  { href: "/dashboard/testimonials", label: "Testimonials", icon: Star, match: "prefix" as const },
  {
    href: "/dashboard/contacts",
    label: "Contacts",
    icon: Briefcase,
    badge: "messages" as const,
    tab: "messages" as const,
    match: "contacts-tab" as const,
  },
  {
    href: "/dashboard/contacts",
    label: "Hire Requests",
    icon: Briefcase,
    badge: "hires" as const,
    tab: "hires" as const,
    match: "contacts-tab" as const,
  },
  { href: "/dashboard/sections", label: "Sections", icon: Layers, match: "prefix" as const },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, match: "prefix" as const },
] as const;

function pageTitle(pathname: string) {
  const map: Record<string, string> = {
    "/dashboard": "Overview",
    "/dashboard/projects": "Projects",
    "/dashboard/newsletter": "Newsletter",
    "/dashboard/revenue": "Revenue",
    "/dashboard/referrals": "Referrals",
    "/dashboard/pricing": "Pricing",
    "/dashboard/testimonials": "Testimonials",
    "/dashboard/contacts": "Contacts",
    "/dashboard/sections": "Page Sections",
    "/dashboard/settings": "Settings",
  };
  return map[pathname] ?? "Dashboard";
}

function isNavActive(
  pathname: string,
  item: (typeof NAV)[number],
  searchParams: URLSearchParams
) {
  if (item.match === "exact") return pathname === item.href;
  if (item.match === "prefix") return pathname === item.href || pathname.startsWith(`${item.href}/`);
  if (item.match === "contacts-tab") {
    if (pathname !== "/dashboard/contacts") return false;
    const tab = searchParams.get("tab") ?? "messages";
    return item.tab === tab;
  }
  return false;
}

function SidebarNavItems({
  unreadContacts,
  newHireRequests,
}: {
  unreadContacts: number;
  newHireRequests: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-4 font-label text-[13px]">
      {NAV.map((item) => {
        const active = isNavActive(pathname, item, searchParams);
        const Icon = item.icon;
        const showRed = "badge" in item && item.badge === "messages" && unreadContacts > 0;
        const showYellow = "badge" in item && item.badge === "hires" && newHireRequests > 0;
        const linkHref = "tab" in item ? `${item.href}?tab=${item.tab}` : item.href;

        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={linkHref}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-[var(--text-secondary)] transition-colors hover:text-white",
              active &&
                "border-l-2 border-[var(--react)] bg-white/[0.06] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-md"
            )}
          >
            <span className="flex items-center gap-2">
              <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" />
              <span>{item.label}</span>
            </span>
            {showRed && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--rust)]" aria-hidden />
            )}
            {showYellow && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--js)]" aria-hidden />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

type Props = {
  children: React.ReactNode;
  unreadContacts: number;
  newHireRequests: number;
};

export function DashboardShell({ children, unreadContacts, newHireRequests }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }, [router]);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col border-r border-[var(--glass-border)] bg-black/55 backdrop-blur-xl">
        <div className="border-b border-[var(--glass-border)]/60 px-4 py-5">
          <div className="flex items-center gap-2">
            <span className="liquid-pill flex h-9 min-w-[2.75rem] items-center justify-center font-label text-xs font-semibold text-white">
              YD
            </span>
            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Dashboard
              </p>
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="flex-1 px-2 py-4 font-label text-[13px] text-[var(--text-muted)]">…</div>}>
          <SidebarNavItems unreadContacts={unreadContacts} newHireRequests={newHireRequests} />
        </Suspense>

        <div className="border-t border-[var(--glass-border)]/60 px-2 py-3">
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 font-label text-[13px] text-[var(--text-muted)] transition-colors hover:text-white"
          >
            <span className="text-base">↗</span>
            <ExternalLink className="h-4 w-4" />
            View Site
          </a>
        </div>

        <div className="mt-auto border-t border-[var(--glass-border)]/60 px-4 py-4">
          <p className="mb-3 font-label text-[11px] text-[var(--go)]">
            <span className="mr-1.5 inline-block text-[10px]">●</span>
            Connected
          </p>
          <AccentButton type="button" variant="ghost" className="w-full font-label text-xs" onClick={() => void logout()}>
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Logout
          </AccentButton>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col pl-[220px]">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[var(--glass-border)]/60 bg-black/40 px-8 py-4 backdrop-blur-md">
          <div>
            <h1 className="font-display text-xl font-normal tracking-[-0.02em] text-white">
              {pageTitle(pathname)}
            </h1>
            <p className="mt-0.5 font-label text-[11px] text-[var(--text-muted)]">{formattedDate}</p>
          </div>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-label text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--react)]"
          >
            View Site →
          </a>
        </header>

        <div className="flex-1 p-8">{children}</div>
      </div>
    </div>
  );
}
