'use client';

import { useWishlist } from "@/lib/wishlist-context";
import { products } from "@/lib/catalog-data";
import { ProductGrid } from "@/components/catalog/product-grid";

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const wishlistedProducts = products.filter((product) => wishlistIds.includes(product.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
      {wishlistedProducts.length > 0 ? (
        <ProductGrid products={wishlistedProducts} />
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-[var(--color-obsidian)] mb-4">Your wishlist is empty.</p>
          <a href="/shop" className="text-[var(--color-brand)] underline">
            Continue Shopping
          </a>
        </div>
      )}
    </div>
  );
}
