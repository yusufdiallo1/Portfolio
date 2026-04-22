import { AvailabilitySettings } from "@/components/dashboard/availability-settings";
import { fetchSiteConfigForDashboard, mapRawToAvailabilityForm } from "@/lib/site-config";

export default async function DashboardSettingsPage() {
  const raw = await fetchSiteConfigForDashboard();
  const initial = mapRawToAvailabilityForm(raw);

  return (
    <div className="max-w-xl space-y-8">
      <AvailabilitySettings initial={initial} />
    </div>
  );
}
