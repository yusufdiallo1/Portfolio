import { DashboardOverviewClient } from "@/components/dashboard/dashboard-overview-client";
import { fetchDashboardOverview } from "@/lib/dashboard-stats";

export default async function DashboardOverviewPage() {
  const data = await fetchDashboardOverview();
  return <DashboardOverviewClient data={data} />;
}
