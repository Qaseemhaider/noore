"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const inputClass =
  "min-h-11 w-full border border-[var(--color-border)] bg-transparent px-4 py-2.5 text-sm placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-crimson)]";

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const orderValid = orderNumber.trim().length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!orderValid || !emailValid) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div role="status">
        <p className="text-[var(--color-obsidian)]">
          Order tracking will be available once your order information is connected.
        </p>
        <p className="mt-3 text-[var(--color-muted)]">
          At launch you will be able to check the status of order{" "}
          <span className="font-semibold text-[var(--color-obsidian)]">{orderNumber.trim()}</span>{" "}
          right here.
        </p>
      </div>
    );
  }

  return (
    <form className="grid w-full max-w-[42rem] gap-5" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="track-order-number" className="type-meta mb-2 block font-semibold">
          Order number
        </label>
        <input
          id="track-order-number"
          type="text"
          autoComplete="off"
          value={orderNumber}
          onChange={(event) => setOrderNumber(event.target.value)}
          aria-invalid={touched && !orderValid ? true : undefined}
          aria-describedby={touched && !orderValid ? "track-order-number-error" : undefined}
          className={inputClass}
        />
        {touched && !orderValid ? (
          <p id="track-order-number-error" className="type-meta mt-2 text-[var(--color-crimson)]">
            Please enter your order number.
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="track-order-email" className="type-meta mb-2 block font-semibold">
          Email
        </label>
        <input
          id="track-order-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={touched && !emailValid ? true : undefined}
          aria-describedby={touched && !emailValid ? "track-order-email-error" : undefined}
          className={inputClass}
        />
        {touched && !emailValid ? (
          <p id="track-order-email-error" className="type-meta mt-2 text-[var(--color-crimson)]">
            Please enter a valid email address.
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit" className="min-w-40">
          Track order
        </Button>
        <p className="type-meta">Tracking will be available after launch.</p>
      </div>
    </form>
  );
}
