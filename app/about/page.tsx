import type { Metadata } from "next";
import { AboutPage } from "@/components/about/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "NOORE is a meeting point between modesty, elegance and contemporary design — a considered modest-fashion wardrobe for the modern woman.",
};

export default function AboutRoute() {
  return <AboutPage />;
}
