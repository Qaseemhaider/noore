import type { Metadata } from "next";
import {
  SupportPageHero,
  SupportSection,
} from "@/components/content/support-page";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description:
    "NOORE's returns and exchanges policy will be published at launch. Learn what to expect and how to prepare.",
};

export default function ReturnsExchangesPage() {
  return (
    <>
      <SupportPageHero
        eyebrow="Returns & exchanges"
        title="Returns & Exchanges"
        intro="We want every NOORE piece to feel right for you. Here is where we stand before launch."
      />
      <SupportSection eyebrow="Our intention" title="Made to feel right">
        <p>
          NOORE will offer returns and exchanges for pieces that are not right
          for you, so you can shop with confidence.
        </p>
        <p>
          The full policy — including return windows, conditions, and how to
          start a return — will be published on this page at launch.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Current status" title="Before launch">
        <p>
          Orders placed before launch are part of our testing process. Please
          keep this in mind, and reach out through{" "}
          <a href="/contact">Contact NOORE</a> if you have any questions about
          an order.
        </p>
        <p>
          We have not yet published return periods, refund timelines, return
          eligibility, or return addresses. These details will be confirmed
          before orders go live.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Getting ready" title="Before you return">
        <p>
          When returns launch, this is what will make the process smooth:
        </p>
        <ul>
          <li>Keep your order number and confirmation.</li>
          <li>Keep the garment in its original condition.</li>
          <li>Contact us through the <a href="/contact">contact page</a> to start your return.</li>
        </ul>
      </SupportSection>
    </>
  );
}
