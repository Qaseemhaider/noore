import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import {
  SupportPageHero,
  SupportSection,
} from "@/components/content/support-page";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Send NOORE a message about orders, products, or sizing, or reach the customer care team directly.",
};

export default function ContactPage() {
  return (
    <>
      <SupportPageHero
        eyebrow="Contact NOORE"
        title="We'd love to hear from you"
        intro="Questions about an order, a product, or sizing — send us a message and we'll reply as soon as we can."
      />
      <SupportSection
        eyebrow="Contact form"
        title="Send us a message"
        contentClassName="max-w-[42rem]"
      >
        <ContactForm />
      </SupportSection>
      <SupportSection eyebrow="Customer care" title="Reach us directly">
        <p>
          For anything you need before launch, email{" "}
          <a href="mailto:hello@noore.com">hello@noore.com</a> or call{" "}
          <a href="tel:+923001234567">+92 300 1234567</a>.
        </p>
        <p>
          Customer care hours will be published on this page at launch.
        </p>
      </SupportSection>
    </>
  );
}
