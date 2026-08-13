'use client';

import { useWishlist } from "@/lib/wishlist-context";
import { HeartIcon } from "@/components/icons";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className = "" }: WishlistButtonProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggleWishlist(productId);
      }}
      className={`flex size-11 items-center justify-center transition-colors hover:text-[var(--color-crimson)] ${className} ${isWishlisted ? 'text-[var(--color-crimson)]' : 'text-[var(--color-obsidian)]'}`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <HeartIcon fill={isWishlisted ? "currentColor" : "none"} />
    </button>
  );
}
