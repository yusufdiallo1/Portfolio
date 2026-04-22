import { AIChat } from "@/components/portfolio/ai-chat";
import { ContactModal } from "@/components/portfolio/contact-modal";
import { Footer } from "@/components/portfolio/footer";
import { PortfolioPageView } from "@/components/portfolio/portfolio-page-view";
import { PortfolioSectionList } from "@/components/portfolio/portfolio-sections";
import { fetchPageSections } from "@/lib/page-sections";
import { fetchCurrentBuilds } from "@/lib/portfolio-builds";
import { fetchPortfolioPricing } from "@/lib/portfolio-pricing";
import { fetchPortfolioProjects } from "@/lib/portfolio-projects";
import { fetchPortfolioTestimonials } from "@/lib/portfolio-testimonials";

export default async function PortfolioHomePage() {
  let sections, projects, pricingTiers, testimonials, builds;

  try {
    [sections, projects, pricingTiers, testimonials, builds] = await Promise.all([
      fetchPageSections(),
      fetchPortfolioProjects(),
      fetchPortfolioPricing(),
      fetchPortfolioTestimonials(),
      fetchCurrentBuilds(),
    ]);
  } catch (err) {
    console.error("[PortfolioHomePage] Data fetch failed:", err);
    // Fallbacks are already handled inside each fetch function, 
    // but we catch here to prevent a total page crash if something 
    // truly unexpected happens (e.g. Promise.all itself failing).
    sections = await fetchPageSections();
    projects = await fetchPortfolioProjects();
    pricingTiers = await fetchPortfolioPricing();
    testimonials = await fetchPortfolioTestimonials();
    builds = await fetchCurrentBuilds();
  }

  return (
    <>
      <PortfolioPageView />
      <main className="min-h-screen bg-[var(--bg)]">
        <PortfolioSectionList
          sections={sections}
          projects={projects}
          pricingTiers={pricingTiers}
          testimonials={testimonials}
          builds={builds}
        />
      </main>
      <Footer />
      <ContactModal />
      <AIChat />
    </>
  );
}
