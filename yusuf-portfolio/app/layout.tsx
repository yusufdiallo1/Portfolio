import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

import { PageAtmosphere } from "@/components/ui/page-atmosphere";
import { Providers } from "@/components/providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-label",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Yusuf Portfolio",
    template: "%s · Yusuf Portfolio",
  },
  description: "Portfolio and dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(instrumentSerif.variable, jetbrainsMono.variable, geistMono.variable)}
      suppressHydrationWarning
    >
      <body className="relative min-h-screen bg-[var(--bg)] font-mono text-[var(--text-primary)] antialiased">
        <PageAtmosphere />
        <div className="relative z-10 min-h-screen">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
