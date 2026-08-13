import type { Metadata } from "next";
import { TrackOrderForm } from "@/components/contact/track-order-form";
import {
  SupportPageHero,
  SupportSection,
} from "@/components/content/support-page";

export const metadata: Metadata = {
  title: "Track Order",
  description:
    "Check the status of your NOORE order with your order number and email address.",
};

export default function TrackOrderPage() {
  return (
    <>
      <SupportPageHero
        eyebrow="Track order"
        title="Track Your Order"
        intro="Enter your order number and the email you ordered with to check your order status."
      />
      <SupportSection
        eyebrow="Order status"
        title="Check your order"
        contentClassName="max-w-[42rem]"
      >
        <TrackOrderForm />
      </SupportSection>
      <SupportSection eyebrow="Help" title="Where do I find my order number?">
        <p>
          Your order number appears on the order confirmation you see after
          placing an order.
        </p>
        <p>
          If you cannot find it, email{" "}
          <a href="mailto:hello@noore.com">hello@noore.com</a> and we will help
          you.
        </p>
      </SupportSection>
    </>
  );
}
