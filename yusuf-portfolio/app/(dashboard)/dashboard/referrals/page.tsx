import { ReferralsManager } from "@/components/dashboard/referrals-manager";
import { fetchDashboardReferrals } from "@/lib/dashboard-queries";

export default async function DashboardReferralsPage() {
  const rows = await fetchDashboardReferrals();
  return <ReferralsManager initialRows={rows} />;
}
