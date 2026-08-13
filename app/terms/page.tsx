import type { Metadata } from "next";
import {
  SupportPageHero,
  SupportSection,
} from "@/components/content/support-page";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that apply when you use the NOORE website. A foundation document, to be completed before launch.",
};

export default function TermsPage() {
  return (
    <>
      <SupportPageHero
        eyebrow="Terms & conditions"
        title="Terms & Conditions"
        intro="The terms below set out how you may use the NOORE website. This is a working foundation, not legal advice — sections marked for completion will be finalized before launch."
      />
      <SupportSection eyebrow="Using this site" title="Scope">
        <p>
          These terms apply to your use of the NOORE website and the services
          it offers. By using this site you agree to these terms.
        </p>
        <p>
          [The legal entity operating NOORE will be named here before launch.]
        </p>
      </SupportSection>
      <SupportSection eyebrow="Shopping" title="Products, prices & orders">
        <p>
          Product descriptions, prices, and available sizes are shown on the
          site as they are entered in the catalogue, and every effort is made
          to keep them accurate. Prices are in Pakistani rupees (PKR).
        </p>
        <p>
          When you place an order you will see an order confirmation on
          screen. Before launch, orders are part of our testing process and are
          not real purchases. Fulfilment, payment processing, and order
          acceptance will be defined here before orders go live.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Payments" title="Payment">
        <p>
          Checkout currently offers card and cash on delivery as simulated
          options. No payment is processed today. Details of how payments are
          handled — and by whom — will be published here at launch.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Returns" title="Returns & refunds">
        <p>
          NOORE intends to offer returns and exchanges. The full policy — and
          any refund terms — will be published on the{" "}
          <a href="/returns-exchanges">Returns & Exchanges</a> page before
          launch.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Your content" title="Reviews & submissions">
        <p>
          You may write product reviews. Reviews must be honest, lawful, and
          respectful. NOORE reserves the right to remove reviews that do not
          meet this standard.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Placeholders" title="To be completed before launch">
        <p>
          The following are held as clear placeholders and will be completed
          with legal input before launch:
        </p>
        <ul>
          <li>[Legal entity name and registration details]</li>
          <li>[Registered address]</li>
          <li>[Governing law and jurisdiction]</li>
          <li>[Dispute resolution process]</li>
          <li>[Limitation of liability wording]</li>
        </ul>
        <p>
          This page is a UI and content foundation only and is not legal
          advice.
        </p>
      </SupportSection>
    </>
  );
}
