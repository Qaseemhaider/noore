'use client';

import { useWishlist } from "@/lib/wishlist-context";
import { products } from "@/lib/catalog-data";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const wishlistedProducts = products.filter((product) => wishlistIds.includes(product.id));

  return (
    <Container className="py-[var(--space-12)]">
      <h1 className="type-page-title mb-[var(--space-8)]">Your Wishlist</h1>
      {wishlistedProducts.length > 0 ? (
        <ProductGrid products={wishlistedProducts} />
      ) : (
        <div className="text-center py-[var(--space-12)]">
          <p className="text-lg text-[var(--color-obsidian)] mb-[var(--space-6)]">Your wishlist is empty.</p>
          <ButtonLink href="/shop" variant="outline">
            Continue Shopping
          </ButtonLink>
        </div>
      )}
    </Container>
  );
}
