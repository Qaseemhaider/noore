"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  AccountIcon,
  BagIcon,
  ChevronIcon,
  CloseIcon,
  FacebookIcon,
  HeartIcon,
  InstagramIcon,
  MenuIcon,
  PinterestIcon,
  SearchIcon,
  TikTokIcon,
} from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";
import {
  shopNavigation,
  socialNavigation,
  supportNavigation,
} from "@/lib/navigation";
import { Wordmark } from "./wordmark";
import { useCart } from "@/lib/cart-context";
import { useIsAuthenticated } from "@/lib/use-auth";

const socialIcons = [
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  PinterestIcon,
];

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const shopId = useId();
  const { setIsOpen: setCartIsOpen } = useCart();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      document.body.dataset.navigationOpen = "true";
    } else if (!open && dialog.open) {
      dialog.close();
    }

    return () => {
      delete document.body.dataset.navigationOpen;
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
    setShopOpen(false);
  }

  return (
    <>
      <IconButton
        ref={triggerRef}
        label="Open navigation menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="lg:hidden"
      >
        <MenuIcon />
      </IconButton>

      <dialog
        ref={dialogRef}
        aria-labelledby="mobile-navigation-title"
        className="m-0 h-dvh max-h-none w-[min(88vw,23rem)] max-w-none overflow-hidden bg-[var(--color-soft-cream)] p-0 text-[var(--color-obsidian)] backdrop:bg-black/55 open:flex open:flex-col"
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onClose={() => {
          delete document.body.dataset.navigationOpen;
          setOpen(false);
          triggerRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeMenu();
        }}
      >
        <header className="flex min-h-20 items-center border-b border-[var(--color-border)] px-3">
          <IconButton label="Close navigation menu" onClick={closeMenu} autoFocus>
            <CloseIcon />
          </IconButton>
          <h2 id="mobile-navigation-title" className="sr-only">
            Main navigation
          </h2>
          <Wordmark className="ml-4 text-[1.75rem]" />
          <span className="ml-auto flex items-center gap-1 pr-2" aria-label="Cart has 0 items">
            <BagIcon />
            <span className="type-meta text-[var(--color-crimson)]">0</span>
          </span>
        </header>

        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-7 py-4">
          <ul className="border-b border-[var(--color-border)] pb-4">
            <li>
              <button
                type="button"
                aria-expanded={shopOpen}
                aria-controls={shopId}
                className="flex min-h-11 w-full items-center justify-between text-left font-semibold uppercase tracking-[0.04em] text-[var(--color-crimson)]"
                onClick={() => setShopOpen((current) => !current)}
              >
                Shop
                <ChevronIcon className={`transition-transform ${shopOpen ? "rotate-90" : ""}`} />
              </button>
              <ul
                id={shopId}
                hidden={!shopOpen}
                className="border-l border-[var(--color-champagne)] pl-4"
              >
                {shopNavigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      prefetch={false}
                      href={item.href}
                      onClick={closeMenu}
                      className="flex min-h-11 items-center text-sm uppercase tracking-[0.04em]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            {shopNavigation.slice(1).map((item) => (
              <li key={`primary-${item.href}`}>
                <Link
                  prefetch={false}
                  href={item.href}
                  onClick={closeMenu}
                  className="flex min-h-11 items-center justify-between text-sm uppercase tracking-[0.04em]"
                >
                  {item.label}
                  <ChevronIcon />
                </Link>
              </li>
            ))}
            <li>
              <Link
                prefetch={false}
                href="/about"
                onClick={closeMenu}
                className="flex min-h-11 items-center text-sm uppercase tracking-[0.04em]"
              >
                About
              </Link>
            </li>
          </ul>

          <ul className="border-b border-[var(--color-border)] py-4">
            <li><Link prefetch={false} href="/search" onClick={closeMenu} className="flex min-h-11 items-center gap-4 text-xs font-semibold uppercase"><SearchIcon /> Search</Link></li>
            <li><Link prefetch={false} href={isAuthenticated ? "/account" : "/login"} onClick={closeMenu} className="flex min-h-11 items-center gap-4 text-xs font-semibold uppercase"><AccountIcon /> {isAuthenticated ? "My Account" : "Sign In"}</Link></li>
            <li><Link prefetch={false} href="/wishlist" onClick={closeMenu} className="flex min-h-11 items-center gap-4 text-xs font-semibold uppercase"><HeartIcon /> Wishlist</Link></li>
            <li><button type="button" onClick={() => { closeMenu(); setCartIsOpen(true); }} className="flex min-h-11 w-full items-center gap-4 text-xs font-semibold uppercase"><BagIcon /> My Cart <span className="text-[var(--color-crimson)]">(0)</span></button></li>
          </ul>

          <ul className="py-4">
            {supportNavigation.map((item) => (
              <li key={item.href}>
                <Link prefetch={false} href={item.href} onClick={closeMenu} className="flex min-h-11 items-center text-xs font-semibold uppercase">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <footer className="border-t border-[var(--color-border)] px-7 py-4">
          <ul aria-label="Social media" className="flex items-center justify-between">
            {socialNavigation.map((item, index) => {
              const Icon = socialIcons[index];
              return <li key={item.label}><a href={item.href} aria-label={item.label} className="flex size-11 items-center justify-center"><Icon /></a></li>;
            })}
          </ul>
        </footer>
      </dialog>
    </>
  );
}
