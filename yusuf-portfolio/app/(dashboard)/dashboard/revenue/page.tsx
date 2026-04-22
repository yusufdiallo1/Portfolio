import { RevenueManager } from "@/components/dashboard/revenue-manager";
import { fetchDashboardHireRequests, fetchRevenueEntries } from "@/lib/dashboard-queries";

export default async function RevenuePage() {
  const [entries, hireRequests] = await Promise.all([
    fetchRevenueEntries(),
    fetchDashboardHireRequests(),
  ]);

  return <RevenueManager initialEntries={entries} hireRequests={hireRequests} />;
}
