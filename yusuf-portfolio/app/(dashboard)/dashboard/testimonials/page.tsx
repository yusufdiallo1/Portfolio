import { TestimonialsManager } from "@/components/dashboard/testimonials-manager";
import { fetchDashboardTestimonials } from "@/lib/dashboard-queries";

export default async function DashboardTestimonialsPage() {
  const rows = await fetchDashboardTestimonials();
  return <TestimonialsManager initialRows={rows} />;
}
