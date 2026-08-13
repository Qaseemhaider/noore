import type { Metadata } from "next";
import {
  SupportPageHero,
  SupportSection,
} from "@/components/content/support-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How NOORE handles your data today — stored in your browser — and how this page will grow as accounts, orders, and payments launch.",
};

export default function PrivacyPage() {
  return (
    <>
      <SupportPageHero
        eyebrow="Privacy policy"
        title="Your Data, Explained Simply"
        intro="This page describes what NOORE does with your information today. It will be updated whenever new features change how your data is handled."
      />
      <SupportSection eyebrow="Today" title="What we store — and where">
        <p>
          Before launch, NOORE runs entirely in your browser. Your bag,
          wishlist, reviews, and order confirmations are kept in your
          browser&apos;s local storage on this device.
        </p>
        <ul>
          <li>
            <strong>Your bag and wishlist</strong> — saved products, kept so
            they persist between visits on the same browser.
          </li>
          <li>
            <strong>Product reviews</strong> — reviews you write are stored on
            your device for now.
          </li>
          <li>
            <strong>Order confirmations</strong> — checkout is simulated, and
            the confirmation you see is kept locally.
          </li>
        </ul>
        <p>
          Because this data lives on your device, it does not leave your
          browser and is not sent to us.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Voluntary" title="What you can share with us">
        <p>
          If you contact us through the contact form or email us directly, you
          choose what to share. The contact form is not connected yet, and
          messages are not sent or stored until it is.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Today" title="What we do not do">
        <ul>
          <li>We do not have an account system yet, so there are no accounts to store.</li>
          <li>We do not have an order database, and we do not process payments — card details are never collected.</li>
          <li>We do not share, sell, or rent your information to anyone.</li>
          <li>We do not track you across the web with third-party advertising.</li>
        </ul>
      </SupportSection>
      <SupportSection eyebrow="Your control" title="Clearing your local data">
        <p>
          Since your data is stored in your browser, you control it. You can
          clear it by clearing your browser&apos;s site data for NOORE, or by
          using the privacy tools in your browser settings.
        </p>
      </SupportSection>
      <SupportSection eyebrow="Future" title="What will change at launch">
        <p>
          When accounts, orders, and payments launch, NOORE will begin to hold
          data on its own systems. When that happens, this page will be updated
          to explain, in plain language:
        </p>
        <ul>
          <li>What we collect and why.</li>
          <li>How long we keep it.</li>
          <li>Who processes it (for example, a payment provider) and why.</li>
          <li>How you can access, correct, or delete it.</li>
        </ul>
        <p>
          The structure of this page is designed for that day — nothing in it
          claims otherwise.
        </p>
      </SupportSection>
    </>
  );
}
