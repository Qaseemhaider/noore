'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LEGACY_ID_TO_SLUG: Record<string, string> = {
  haya: "noore-e-haya-abaya",
  luna: "luna-abaya",
  dusk: "dusk-embroidered-abaya",
  elegance: "elegance-abaya",
  chiffon: "chiffon-hijab",
  chadar: "noore-chadar",
  jersey: "premium-jersey-hijab",
  linen: "linen-abaya",
};

const normalizeIds = (ids: string[]) => ids.map((id) => LEGACY_ID_TO_SLUG[id] ?? id);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      setWishlistIds(savedWishlist ? normalizeIds(JSON.parse(savedWishlist)) : []);
    } catch {
      setWishlistIds([]);
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistIds));
    }
  }, [wishlistIds]);

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prevIds) =>
      prevIds.includes(productId)
        ? prevIds.filter((id) => id !== productId)
        : [...prevIds, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
