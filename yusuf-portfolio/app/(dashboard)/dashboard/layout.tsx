import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSession } from "@/lib/auth";
import { hasAdminCredentials } from "@/lib/admin-credentials";
import { getDashboardBadgeCounts } from "@/lib/dashboard-badges";

export default async function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasAdmin = await hasAdminCredentials();
  if (!hasAdmin) {
    redirect("/setup");
  }

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const badges = await getDashboardBadgeCounts();

  return (
    <DashboardShell unreadContacts={badges.unreadContacts} newHireRequests={badges.newHireRequests}>
      {children}
    </DashboardShell>
  );
}
