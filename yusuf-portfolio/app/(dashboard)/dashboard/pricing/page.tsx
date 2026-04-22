import { PricingDashboard } from "@/components/dashboard/pricing-dashboard";
import { fetchDashboardPricing } from "@/lib/dashboard-queries";

export default async function DashboardPricingPage() {
  const rows = await fetchDashboardPricing();
  return <PricingDashboard initialRows={rows} />;
}
