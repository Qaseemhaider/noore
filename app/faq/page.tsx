import type { Metadata } from "next";
import { FaqAccordion } from "@/components/content/faq-accordion";
import {
  SupportPageHero,
  SupportSection,
} from "@/components/content/support-page";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about ordering, shipping, sizing, returns, payments, and care at NOORE.",
};

export default function FaqPage() {
  return (
    <>
      <SupportPageHero
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        intro="Quick answers about ordering, shipping, sizing, and more. Can't find what you need? Reach out on the contact page."
      />
      <SupportSection eyebrow="Orders" title="Ordering">
        <FaqAccordion id="ordering"
          items={[
            {
              question: "How do I place an order?",
              answer: (
                <>
                  Add the pieces you love to your bag, review your bag in the
                  cart, then continue to checkout. Complete your delivery
                  details and choose a payment method to finish.
                </>
              ),
            },
            {
              question: "Do I need an account to order?",
              answer: (
                <>
                  No. Account creation is not available yet — checkout works
                  without one. You will be able to create an account at a later
                  stage.
                </>
              ),
            },
            {
              question: "Can I shop from my wishlist?",
              answer: (
                <>
                  Yes. Open your wishlist from the header, choose a saved
                  product, and add it to your bag. Your wishlist is stored in
                  your browser, so it stays on the device you saved it on.
                </>
              ),
            },
          ]}
        />
      </SupportSection>
      <SupportSection eyebrow="Delivery" title="Shipping & delivery">
        <FaqAccordion id="shipping"
          items={[
            {
              question: "Is shipping free?",
              answer: (
                <>
                  Standard delivery is free on orders above PKR 10,000. On
                  lower-value orders, the standard charge is calculated at
                  checkout. Express delivery is a flat PKR 500.
                </>
              ),
            },
            {
              question: "How long will my order take to arrive?",
              answer: (
                <>
                  Estimated delivery windows may be shown at checkout. These are
                  estimates, not guarantees — actual times depend on the
                  courier and your location.
                </>
              ),
            },
            {
              question: "How do I track my order?",
              answer: (
                <>
                  Order tracking will be available once your order information
                  is connected. You will be able to check your status on the{" "}
                  <a href="/track-order">Track Order</a> page.
                </>
              ),
            },
          ]}
        />
      </SupportSection>
      <SupportSection eyebrow="Fit" title="Sizing">
        <FaqAccordion id="sizing"
          items={[
            {
              question: "How do I know which size to choose?",
              answer: (
                <>
                  The <a href="/size-guide">Size Guide</a> lists the available
                  sizes for every product in the collection, straight from each
                  product listing.
                </>
              ),
            },
            {
              question: "Are hijabs and chadars one size?",
              answer: (
                <>
                  Yes. All of our hijabs and chadars are One Size and are
                  designed to drape comfortably for most wearers.
                </>
              ),
            },
            {
              question: "Are there detailed measurements for abayas?",
              answer: (
                <>
                  Not yet. Abayas are currently sized S–XL, and detailed garment
                  measurements will be added to the size guide before launch.
                </>
              ),
            },
          ]}
        />
      </SupportSection>
      <SupportSection eyebrow="After your order" title="Returns & exchanges">
        <FaqAccordion id="returns"
          items={[
            {
              question: "Can I return or exchange an item?",
              answer: (
                <>
                  Returns and exchanges will be offered after launch, and the
                  full policy will be published on the{" "}
                  <a href="/returns-exchanges">Returns & Exchanges</a> page
                  before then.
                </>
              ),
            },
          ]}
        />
      </SupportSection>
      <SupportSection eyebrow="Care" title="Product care">
        <FaqAccordion id="care"
          items={[
            {
              question: "How do I care for my NOORE pieces?",
              answer: (
                <>
                  Care instructions are listed on every product page, based on
                  the fabric of each piece. Following them keeps your garments
                  looking their best for longer.
                </>
              ),
            },
          ]}
        />
      </SupportSection>
      <SupportSection eyebrow="Checkout" title="Payments">
        <FaqAccordion id="payments"
          items={[
            {
              question: "Which payment methods are available?",
              answer: (
                <>
                  Card and cash on delivery are available at checkout.
                </>
              ),
            },
            {
              question: "Is my payment information safe?",
              answer: (
                <>
                  Before launch, checkout is simulated — card details are not
                  collected, stored, or transmitted. At launch, payments will be
                  handled through a payment provider, and this page will be
                  updated with the details.
                </>
              ),
            },
          ]}
        />
      </SupportSection>
      <SupportSection eyebrow="Your NOORE" title="Wishlist & account">
        <FaqAccordion id="account"
          items={[
            {
              question: "How does my wishlist work?",
              answer: (
                <>
                  Save products with the heart icon on any product card or
                  product page. Your wishlist is stored in your browser, so it
                  stays on the device you saved it on.
                </>
              ),
            },
            {
              question: "Will I be able to create an account?",
              answer: (
                <>
                  Yes — accounts are planned for a later stage. When they
                  launch, you will be able to manage your details, orders, and
                  wishlist from one place.
                </>
              ),
            },
            {
              question: "Where is my bag and wishlist stored?",
              answer: (
                <>
                  Both are kept in your browser&apos;s local storage on this
                  device. They persist between visits on the same browser but do
                  not follow you across devices.
                </>
              ),
            },
          ]}
        />
      </SupportSection>
    </>
  );
}
