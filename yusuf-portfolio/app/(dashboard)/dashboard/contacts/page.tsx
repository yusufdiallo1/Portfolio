import { ContactsManager } from "@/components/dashboard/contacts-manager";
import { fetchDashboardContactMessages, fetchDashboardHireRequests } from "@/lib/dashboard-queries";

export default async function DashboardContactsPage() {
  const [messages, hires] = await Promise.all([
    fetchDashboardContactMessages(),
    fetchDashboardHireRequests(),
  ]);
  return <ContactsManager initialMessages={messages} initialHires={hires} />;
}
