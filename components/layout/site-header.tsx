'use client';
import Link from "next/link";
import {
  AccountIcon,
  BagIcon,
  HeartIcon,
  SearchIcon,
} from "@/components/icons";
import { Container } from "@/components/ui/container";
import { DesktopNavigation } from "./desktop-navigation";
import { MobileNavigation } from "./mobile-navigation";
import { Wordmark } from "./wordmark";
import { useCart } from "@/lib/cart-context";
import { useSearch } from "@/lib/search-context";

export function SiteHeader() {
  const { items, setIsOpen: setCartIsOpen } = useCart();
  const { setIsOpen: setSearchIsOpen } = useSearch();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="home-entrance-header relative z-[var(--z-header)] border-b border-[var(--color-border)] bg-[var(--color-soft-cream)]">
      <Container className="grid min-h-20 grid-cols-[1fr_auto_1fr] items-center lg:min-h-24 lg:grid-cols-[auto_1fr_auto] lg:gap-12">
        <div className="flex items-center lg:hidden">
          <MobileNavigation />
        </div>
        <Wordmark className="justify-self-center lg:justify-self-start" />
        <div className="hidden justify-self-center lg:block">
          <DesktopNavigation />
        </div>
        <nav aria-label="Account and shopping" className="flex items-center justify-self-end">
          <button type="button" aria-label="Search" onClick={() => setSearchIsOpen(true)} className="flex size-11 items-center justify-center transition-colors hover:text-[var(--color-crimson)]"><SearchIcon /></button>
          <Link prefetch={false} href="/account" aria-label="My account" className="hidden size-11 items-center justify-center transition-colors hover:text-[var(--color-crimson)] sm:flex"><AccountIcon /></Link>
          <Link prefetch={false} href="/wishlist" aria-label="Wishlist" className="hidden size-11 items-center justify-center transition-colors hover:text-[var(--color-crimson)] lg:flex"><HeartIcon /></Link>
          <button type="button" onClick={() => setCartIsOpen(true)} aria-label={`Open cart, ${itemCount} items`} className="relative flex size-11 items-center justify-center transition-colors hover:text-[var(--color-crimson)]">
            <BagIcon />
            <span aria-hidden="true" className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--color-crimson)] text-[0.55rem] font-bold text-white">{itemCount}</span>
          </button>
        </nav>
      </Container>
    </header>
  );
}
