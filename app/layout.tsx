import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const uiFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NOORE — Timeless Modest Fashion",
    template: "%s | NOORE",
  },
  description:
    "Timeless modest fashion designed for the modern woman. Discover NOORE abayas, hijabs, and chadars.",
  applicationName: "NOORE",
  category: "shopping",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${displayFont.variable} ${uiFont.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a className="skip-link type-button" href="#main-content">
          Skip to content
        </a>
        <AnnouncementBar />
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <noscript>
          <style>{`[data-home-hero] [data-home-entrance],[data-home-hero] a,[data-home-hero]::after{animation-play-state:running!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
