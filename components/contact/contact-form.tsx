"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const subjects = [
  "Order support",
  "Shipping",
  "Returns & exchanges",
  "Product question",
  "Size advice",
  "Something else",
];

const inputClass =
  "min-h-11 w-full border border-[var(--color-border)] bg-transparent px-4 py-2.5 text-sm placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-crimson)]";

type Values = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const initialValues: Values = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export function ContactForm() {
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    field: keyof Values,
    value: string,
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validate(next: Values): Errors {
    const nextErrors: Errors = {};
    if (!next.name.trim()) nextErrors.name = "Please enter your name.";
    if (!next.email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!next.subject) nextErrors.subject = "Please choose a subject.";
    if (next.message.trim().length < 10) {
      nextErrors.message = "Please write a message of at least 10 characters.";
    }
    return nextErrors;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(false);
      return;
    }
    setSubmitted(true);
  }

  function handleReset() {
    setValues(initialValues);
    setErrors({});
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="max-w-[42rem]" role="status">
        <p className="text-[var(--color-obsidian)]">
          Thank you, {values.name.trim().split(/\s+/)[0] || "friend"}. Your message has been
          received, but NOORE&apos;s contact system is not connected yet.
        </p>
        <p className="mt-3 text-[var(--color-muted)]">
          For anything you need before launch, please email{" "}
          <a
            className="text-[var(--color-crimson)] underline underline-offset-3"
            href="mailto:hello@noore.com"
          >
            hello@noore.com
          </a>
          .
        </p>
        <div className="mt-6">
          <Button variant="outline" onClick={handleReset}>
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="grid w-full max-w-[42rem] gap-5"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="type-meta mb-2 block font-semibold">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(event) => handleChange("name", event.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={inputClass}
          />
          {errors.name ? (
            <p id="contact-name-error" className="type-meta mt-2 text-[var(--color-crimson)]">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="contact-email" className="type-meta mb-2 block font-semibold">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => handleChange("email", event.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={inputClass}
          />
          {errors.email ? (
            <p id="contact-email-error" className="type-meta mt-2 text-[var(--color-crimson)]">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>
      <div>
        <label htmlFor="contact-phone" className="type-meta mb-2 block font-semibold">
          Phone <span className="font-normal">(optional)</span>
        </label>
        <input
          id="contact-phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(event) => handleChange("phone", event.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-subject" className="type-meta mb-2 block font-semibold">
          Subject
        </label>
        <select
          id="contact-subject"
          value={values.subject}
          onChange={(event) => handleChange("subject", event.target.value)}
          aria-invalid={errors.subject ? true : undefined}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
          className={`${inputClass} ${values.subject ? "" : "text-[var(--color-muted)]"}`}
        >
          <option value="" disabled>
            Choose a subject
          </option>
          {subjects.map((subject) => (
            <option key={subject} value={subject} className="text-[var(--color-obsidian)]">
              {subject}
            </option>
          ))}
        </select>
        {errors.subject ? (
          <p id="contact-subject-error" className="type-meta mt-2 text-[var(--color-crimson)]">
            {errors.subject}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="contact-message" className="type-meta mb-2 block font-semibold">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={6}
          value={values.message}
          onChange={(event) => handleChange("message", event.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={`${inputClass} resize-y`}
        />
        {errors.message ? (
          <p id="contact-message-error" className="type-meta mt-2 text-[var(--color-crimson)]">
            {errors.message}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit" className="min-w-40">
          Send message
        </Button>
        <p className="type-meta">Frontend form only — messages are not sent yet.</p>
      </div>
    </form>
  );
}
