import Link from "next/link";
import {
  FacebookIcon,
  InstagramIcon,
  PinterestIcon,
  TikTokIcon,
} from "@/components/icons";
import { Container } from "@/components/ui/container";
import { footerGroups, socialNavigation } from "@/lib/navigation";
import { Newsletter } from "./newsletter";

const socialIcons = [InstagramIcon, FacebookIcon, TikTokIcon, PinterestIcon];

function FooterLinkGroup({
  title,
  links,
}: (typeof footerGroups)[number]) {
  return (
    <div className="hidden md:block">
      <h2 className="type-label mb-5 text-white">{title}</h2>
      <ul className="space-y-3 text-xs text-white/75">
        {links.map((item) => <li key={`${title}-${item.href}`}><Link prefetch={false} className="transition-colors hover:text-white" href={item.href}>{item.label}</Link></li>)}
      </ul>
    </div>
  );
}

function FooterAccordion({
  title,
  links,
}: (typeof footerGroups)[number]) {
  return (
    <details className="group border-b border-white/20 md:hidden">
      <summary className="type-label flex min-h-14 cursor-pointer list-none items-center justify-between text-white [&::-webkit-details-marker]:hidden">
        {title}<span aria-hidden="true" className="text-lg font-light transition-transform group-open:rotate-45">+</span>
      </summary>
      <ul className="space-y-1 pb-4 text-sm text-white/75">
        {links.map((item) => <li key={`${title}-${item.href}`}><Link prefetch={false} className="flex min-h-11 items-center" href={item.href}>{item.label}</Link></li>)}
      </ul>
    </details>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <Newsletter />
      <div className="bg-[var(--color-obsidian)] text-white">
        <Container className="py-10 md:py-16">
          <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(4,1fr)] md:gap-8">
            <div>
              <Link href="/" aria-label="NOORE home" className="font-serif text-[2rem] leading-none">NOORE</Link>
              <p className="mt-5 max-w-52 text-xs leading-5 text-white/70">Timeless modest fashion for the modern woman.</p>
              <ul aria-label="Social media" className="mt-5 flex gap-2">
                {socialNavigation.map((item, index) => {
                  const Icon = socialIcons[index];
                  return <li key={item.label}><a href={item.href} aria-label={item.label} className="flex size-11 items-center justify-center text-white/80 transition-colors hover:text-white"><Icon /></a></li>;
                })}
              </ul>
            </div>
            {footerGroups.map((group) => <FooterLinkGroup key={group.title} {...group} />)}
          </div>
          <div className="mt-7 md:hidden">
            {footerGroups.map((group) => <FooterAccordion key={group.title} {...group} />)}
          </div>
          <div className="mt-10 flex flex-col gap-4 border-t border-white/20 pt-6 text-[0.6875rem] text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 NOORE. All rights reserved.</p>
            <p aria-label="Accepted payment methods">VISA · Mastercard · Apple Pay</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
