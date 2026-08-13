'use client';

import { useEffect, useState } from "react";
import { useWishlist } from "@/lib/wishlist-context";
import { getWishlistProductsAction } from "@/lib/catalog/actions";
import type { Product } from "@/lib/catalog-data";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

type WishlistStatus = 'idle' | 'loading' | 'ready' | 'error';

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<WishlistStatus>('idle');

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setProducts([]);
      setStatus('idle');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    getWishlistProductsAction(wishlistIds)
      .then((resolved) => {
        if (cancelled) return;
        setProducts(resolved);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [wishlistIds]);

  return (
    <Container className="py-[var(--space-12)]">
      <h1 className="type-page-title mb-[var(--space-8)]">Your Wishlist</h1>
      {wishlistIds.length === 0 ? (
        <div className="text-center py-[var(--space-12)]">
          <p className="text-lg text-[var(--color-obsidian)] mb-[var(--space-6)]">Your wishlist is empty.</p>
          <ButtonLink href="/shop" variant="outline">
            Continue Shopping
          </ButtonLink>
        </div>
      ) : status === 'error' ? (
        <div className="text-center py-[var(--space-12)]">
          <p className="text-lg text-[var(--color-obsidian)] mb-[var(--space-6)]">Something went wrong. Please try again.</p>
          <ButtonLink href="/shop" variant="outline">
            Continue Shopping
          </ButtonLink>
        </div>
      ) : products.length > 0 ? (
        <ProductGrid products={products} />
      ) : status === 'ready' ? (
        <div className="text-center py-[var(--space-12)]">
          <p className="text-lg text-[var(--color-obsidian)] mb-[var(--space-6)]">Your saved items are no longer available.</p>
          <ButtonLink href="/shop" variant="outline">
            Continue Shopping
          </ButtonLink>
        </div>
      ) : null}
    </Container>
  );
}
