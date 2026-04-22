import type { Metadata } from "next";

import { AIChat } from "@/components/portfolio/ai-chat";
import { ContactModal } from "@/components/portfolio/contact-modal";
import { Footer } from "@/components/portfolio/footer";
import { ReferPageContent } from "@/components/portfolio/refer-page-content";

export const metadata: Metadata = {
  title: "Refer a Friend",
  description:
    "Refer someone who needs a website or app built. When they hire Yusuf, you get rewarded with a discount on your next project.",
};

export default function ReferPage() {
  return (
    <>
      <main className="min-h-screen bg-[var(--bg)] pt-24 text-[var(--text-primary)] md:pt-28">
        <ReferPageContent />
      </main>
      <Footer />
      <ContactModal />
      <AIChat />
    </>
  );
}
