import { About } from "@/components/portfolio/about";
import { CurrentlyBuilding } from "@/components/portfolio/currently-building";
import { Faq } from "@/components/portfolio/faq";
import { HeroSection } from "@/components/portfolio/HeroSection";
import { HireForm } from "@/components/portfolio/hire-form";
import { Newsletter } from "@/components/portfolio/newsletter";
import { Pricing } from "@/components/portfolio/pricing";
import { Projects } from "@/components/portfolio/projects";
import { Skills } from "@/components/portfolio/skills";
import { Testimonials } from "@/components/portfolio/testimonials";
import { SectionTransition } from "@/components/ui/section-transition";
import type { PageSectionRow } from "@/lib/page-sections";
import type { PricingTier } from "@/lib/portfolio-pricing";
import type { CurrentBuild } from "@/lib/portfolio-builds";
import type { PortfolioProject } from "@/lib/portfolio-projects";
import type { PortfolioTestimonial } from "@/lib/portfolio-testimonials";

const SECTION_COLORS: Record<string, string> = {
  about: "var(--rust)",
  skills: "var(--react)",
  projects: "var(--ts)",
  "currently-building": "var(--go)",
  pricing: "var(--js)",
  hire: "var(--go)",
  newsletter: "var(--react)",
  testimonials: "var(--css)",
  faq: "var(--python)",
};

type Props = {
  sections: PageSectionRow[];
  projects: PortfolioProject[];
  pricingTiers: PricingTier[];
  testimonials: PortfolioTestimonial[];
  builds: CurrentBuild[];
};

export function PortfolioSectionList({ sections, projects, pricingTiers, testimonials, builds }: Props) {
  let sectionIndex = 0;

  // Build the ordered section list, injecting our new sections after "projects" and after "faq"
  const orderedSections: Array<{ key: string; isDbSection: boolean }> = [];
  for (const s of sections) {
    orderedSections.push({ key: s.section_key, isDbSection: true });
    if (s.section_key === "projects") {
      orderedSections.push({ key: "currently-building", isDbSection: false });
    }
    if (s.section_key === "faq") {
      orderedSections.push({ key: "newsletter", isDbSection: false });
    }
  }

  return (
    <>
      {orderedSections.map(({ key }) => {
        const isHero = key === "hero";
        const color = SECTION_COLORS[key];
        const idx = isHero ? undefined : sectionIndex++;

        const inner = (() => {
          switch (key) {
            case "hero":
              return <HeroSection key={key} />;
            case "about":
              return <About key={key} />;
            case "skills":
              return <Skills key={key} />;
            case "projects":
              return <Projects key={key} projects={projects} />;
            case "currently-building":
              return <CurrentlyBuilding key={key} builds={builds} />;
            case "pricing":
              return <Pricing key={key} tiers={pricingTiers} />;
            case "hire":
              return <HireForm key={key} />;
            case "newsletter":
              return <Newsletter key={key} />;
            case "testimonials":
              return <Testimonials key={key} testimonials={testimonials} />;
            case "faq":
              return <Faq key={key} />;
            default:
              return null;
          }
        })();

        if (!inner) return null;
        if (isHero) return inner;

        return (
          <SectionTransition key={key} index={idx} color={color}>
            {inner}
          </SectionTransition>
        );
      })}
    </>
  );
}
