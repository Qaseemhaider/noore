import type { Metadata } from "next";
import {
  SupportPageHero,
  SupportSection,
} from "@/components/content/support-page";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description:
    "NOORE delivery options: standard delivery free on orders above PKR 10,000, and express delivery for PKR 500.",
};

export default function ShippingDeliveryPage() {
  return (
    <>
      <SupportPageHero
        eyebrow="Shipping & delivery"
        title="Shipping & Delivery"
        intro="We deliver across Pakistan. Choose your delivery method at checkout."
      />
      <SupportSection eyebrow="Delivery options" title="Standard delivery">
        <p>
          Standard delivery is <strong>free</strong> on orders above{" "}
          <strong>PKR 10,000</strong>.
        </p>
        <p>
          On orders below PKR 10,000, the standard delivery charge is calculated
          at checkout based on your delivery location.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Delivery options" title="Express delivery">
        <p>
          Express delivery is available for a flat <strong>PKR 500</strong> and
          can be selected at checkout.
        </p>
        <p>
          The express charge is applied by the delivery calculation, which will
          be confirmed server-side when orders go live.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Order updates" title="Order confirmation & tracking">
        <p>
          When you place an order, you will see an order confirmation on
          screen. A copy of your order is kept in your browser so you can review
          it later.
        </p>
        <p>
          Order tracking will be available once your order information is
          connected — you will be able to check your order status on the{" "}
          <a href="/track-order">Track Order</a> page.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Estimates" title="Delivery estimates">
        <p>
          Estimated delivery windows may be shown at checkout. These are
          estimates only and are not a guarantee of delivery time.
        </p>
        <p>
          We do not publish delivery-time guarantees before launch. Delivery
          times can be affected by courier availability, your location, and
          order volumes.
        </p>
      </SupportSection>
    </>
  );
}
