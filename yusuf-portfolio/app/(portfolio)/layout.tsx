import type { Metadata } from "next";

import { AvailabilityBanner } from "@/components/portfolio/availability-banner";
import { BookCallButton } from "@/components/portfolio/book-call-button";
import { ContactModalProvider } from "@/components/portfolio/contact-modal";
import { CookieConsentBanner } from "@/components/portfolio/cookie-consent";
import { PortfolioNav } from "@/components/portfolio/portfolio-nav";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { fetchAvailabilityConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Yusuf Diallo — Full Stack Developer",
  description:
    "I build amazing apps fast. Next.js, React, Supabase, ClaudeCode. Hire me for your next project.",
  metadataBase: new URL("https://yusufdiallo.dev"),
  openGraph: {
    type: "website",
    url: "https://yusufdiallo.dev",
    title: "Yusuf Diallo — Full Stack Developer",
    description:
      "I build amazing apps fast. Next.js, React, Supabase, ClaudeCode. Hire me for your next project.",
    siteName: "Yusuf Diallo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yusuf Diallo — Full Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yusuf Diallo — Full Stack Developer",
    description:
      "I build amazing apps fast. Next.js, React, Supabase, ClaudeCode. Hire me for your next project.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://yusufdiallo.dev",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Yusuf Diallo",
  url: "https://yusufdiallo.dev",
  jobTitle: "Full Stack Developer",
  knowsAbout: [
    "Next.js",
    "React",
    "TypeScript",
    "Supabase",
    "Tailwind CSS",
    "ClaudeCode",
    "Node.js",
    "Go",
    "Vercel",
    "Full Stack Development",
  ],
  email: "mailto:yusufdiallo11@gmail.com",
};

export default async function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const availability = await fetchAvailabilityConfig();
  const bannerOn = availability.showBanner;

  return (
    <ContactModalProvider>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LoadingScreen />
      <CustomCursor />
      <AvailabilityBanner config={availability} />
      <PortfolioNav bannerOffsetPx={bannerOn ? 36 : 0} />
      {/* Offset page content below the fixed availability strip + keep hero clearing the fixed nav */}
      <div className={bannerOn ? "pt-9" : undefined}>{children}</div>
      <CookieConsentBanner />
      <BookCallButton calendlyUrl={availability.calendlyUrl} />
    </ContactModalProvider>
  );
}
