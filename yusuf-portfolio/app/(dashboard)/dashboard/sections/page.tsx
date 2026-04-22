import { SectionsManager } from "@/components/dashboard/sections-manager";
import { fetchDashboardPageSections } from "@/lib/dashboard-queries";

export default async function DashboardSectionsPage() {
  const sections = await fetchDashboardPageSections();
  return <SectionsManager initialSections={sections} />;
}
