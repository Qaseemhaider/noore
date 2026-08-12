'use client';
import { Product } from "@/lib/catalog-data";
import { Button } from "@/components/ui/button";

interface StickyAddToCartBarProps {
  product: Product;
  isVisible: boolean;
  onAddToCart: () => void;
}

export function StickyAddToCartBar({
  isVisible,
  onAddToCart,
}: StickyAddToCartBarProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[var(--z-header)] bg-[var(--color-soft-cream)] border-t border-[var(--color-border)] p-[var(--space-4)] transition-transform duration-[var(--duration-base)] ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="max-w-[400px] mx-auto pb-[env(safe-area-inset-bottom)]">
        <Button 
            onClick={onAddToCart} 
            className="w-full h-[var(--space-14)] uppercase tracking-widest text-[var(--text-label)]"
        >
          Add to Bag
        </Button>
      </div>
    </div>
  );
}
