import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Newsletter() {
  return (
    <section aria-labelledby="newsletter-title" className="grid min-h-64 grid-cols-[1.8fr_1fr] border-t border-[var(--color-border)] bg-[var(--color-soft-cream)] md:mx-auto md:min-h-[27rem] md:w-[calc(100%-8rem)] md:max-w-[80rem] md:grid-cols-[.9fr_1.1fr]">
      <div className="relative order-2 min-h-full md:order-none">
        <Image src="/images/home/newsletter-temporary.png" alt="Ivory ceramic vessels with dried botanicals" fill sizes="(max-width: 767px) 36vw, 45vw" className="object-cover" />
      </div>
      <div className="flex items-center px-4 py-6 md:px-20 md:py-8">
        <div className="w-full max-w-xl">
          <h2 id="newsletter-title" className="type-section-title">Be the first to know</h2>
          <p className="mt-3 max-w-md text-sm text-[var(--color-muted)]">New arrivals, exclusive offers and modest style inspiration.</p>
        <form className="mt-5 flex flex-col gap-2 sm:flex-row md:mt-8 md:gap-3" action="#newsletter" method="get">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="Enter your email" className="min-h-11 flex-1 border border-[var(--color-border)] bg-transparent px-4 text-sm placeholder:text-[var(--color-muted)]" />
          <Button type="submit" className="sm:min-w-36">Subscribe</Button>
        </form>
        </div>
      </div>
    </section>
  );
}
