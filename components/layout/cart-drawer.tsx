'use client';

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { CloseIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format-price";
import Image from "next/image";
import { useRouter } from "next/navigation";

const CLOSE_DURATION = 240;

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, subtotal } = useCart();
  const SHIPPING_THRESHOLD = 10000;
  const router = useRouter();

  const [rendered, setRendered] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      renderedRef.current = true;
      setRendered(true);
      setClosing(false);
      document.body.style.overflow = "hidden";
    } else if (renderedRef.current) {
      setClosing(true);
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const duration = reduced ? 0 : CLOSE_DURATION;
      const t = setTimeout(() => {
        renderedRef.current = false;
        setRendered(false);
        setClosing(false);
        document.body.style.overflow = "";
        restoreFocusRef.current?.focus();
      }, duration);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (rendered && !closing) {
      closeButtonRef.current?.focus();
    }
  }, [rendered, closing]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [setIsOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!rendered) return null;

  const handleCheckout = () => {
    setIsOpen(false);
    router.push('/checkout/information');
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className="fixed inset-0 z-[var(--z-drawer)] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      onKeyDown={handleKeyDown}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-[var(--color-obsidian)]/50 transition-opacity duration-[var(--duration-base)] ${closing ? "opacity-0" : "opacity-100"}`}
        onClick={() => setIsOpen(false)}
      />
      <div
        ref={panelRef}
        className={`relative flex h-full w-full max-w-md flex-col bg-[var(--color-soft-cream)] shadow-xl transition-transform duration-[var(--duration-base)] ease-[var(--ease-out)] ${closing ? "translate-x-full" : "translate-x-0"}`}
      >
        <header className="flex items-center justify-between p-6">
          <h2 id="cart-drawer-title" className="font-serif text-[var(--text-section-title)]">Your Bag</h2>
          <button
            ref={closeButtonRef}
            onClick={() => setIsOpen(false)}
            aria-label="Close cart"
            className="flex size-11 items-center justify-center transition-colors hover:text-[var(--color-crimson)]"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-start gap-[var(--space-6)]">
              <p>Your bag is empty.</p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
                  <Image src={item.image.src} alt={item.name} width={80} height={80} className="object-cover" />
                  <div className="flex-1">
                    <h3 className="font-medium text-[var(--color-obsidian)]">{item.name}</h3>
                    <p className="text-sm text-[var(--color-muted)]">{item.size} / {item.color}</p>
                    <p className="type-price text-[var(--color-obsidian)]">{formatPrice(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="flex size-11 items-center justify-center border border-[var(--color-border)] transition-colors hover:border-[var(--color-crimson)]"
                      >
                        -
                      </button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="flex size-11 items-center justify-center border border-[var(--color-border)] transition-colors hover:border-[var(--color-crimson)]"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-4 text-sm text-[var(--color-crimson)] transition-colors hover:text-[var(--color-crimson-hover)]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {items.length === 0 ? "Your bag is empty." : `${itemCount} ${itemCount === 1 ? "item" : "items"} in your bag, subtotal ${formatPrice(subtotal)}`}
        </p>
        {items.length > 0 && (
          <footer className="border-t border-[var(--color-border)] p-6">
            <div className="mb-4">
              <p className="text-sm text-[var(--color-muted)]">Shipping: {subtotal >= SHIPPING_THRESHOLD ? "Free" : formatPrice(SHIPPING_THRESHOLD - subtotal) + " away from free shipping"}</p>
              <div className="mt-1 h-2 w-full bg-[var(--color-surface-muted)]">
                <div className="h-full bg-[var(--color-crimson)]" style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="flex justify-between text-lg font-medium text-[var(--color-obsidian)]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Button onClick={handleCheckout} className="mt-6 w-full">Checkout</Button>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="mt-3 w-full">
              Continue Shopping
            </Button>
          </footer>
        )}
      </div>
    </div>
  );
}
