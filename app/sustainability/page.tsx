import type { Metadata } from "next";
import {
  SupportPageHero,
  SupportSection,
} from "@/components/content/support-page";

export const metadata: Metadata = {
  title: "Sustainability",
  description:
    "NOORE's intentions around thoughtful design, quality that lasts, and a more mindful way of making modest fashion.",
};

export default function SustainabilityPage() {
  return (
    <>
      <SupportPageHero
        eyebrow="Sustainability"
        title="Thoughtful by Design"
        intro="Sustainability is not something we claim — it is something we are working toward, honestly and step by step."
      />
      <SupportSection eyebrow="Our intention" title="Fewer, better pieces">
        <p>
          NOORE began with a simple idea: a wardrobe made of a few pieces you
          truly reach for, rather than many you don&apos;t.
        </p>
        <p>
          We design timeless silhouettes in considered colours, so each piece
          earns its place in your wardrobe and stays with you for years.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Our direction" title="What we are working toward">
        <ul>
          <li>Materials that are chosen with their impact in mind.</li>
          <li>Quality that lasts — fabrics and finishes made to be worn, washed, and worn again.</li>
          <li>Mindful packaging that is no more than it needs to be.</li>
          <li>A supply chain we understand, so we can speak about it truthfully.</li>
        </ul>
        <p>
          These are intentions. We are building toward them, and we will share
          real, specific progress as it happens.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Honesty" title="What we are not claiming yet">
        <p>
          We have not earned the words you sometimes see in fashion. To be
          clear:
        </p>
        <ul>
          <li>We hold no certifications and make no certification claims.</li>
          <li>We are not claiming recycled-content percentages or carbon-neutral operations.</li>
          <li>We are not claiming a specific ethical-factory standard.</li>
        </ul>
        <p>
          When these things are true, we will say so — with the details to
          back them up.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Care" title="Caring for what you own">
        <p>
          The most sustainable garment is the one you already own. Following
          the care instructions on each product page keeps your pieces beautiful
          for longer and reduces how often they need replacing.
        </p>
      </SupportSection>
    </>
  );
}
