'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

import { ProductImage, products } from "./catalog-data";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  image: ProductImage;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const CART_VERSION = '3';

    const savedCart = localStorage.getItem('cart');
    const version = localStorage.getItem('cart-version');

    let parsedCart: CartItem[] = [];
    if (savedCart) {
      try {
        parsedCart = JSON.parse(savedCart);
      } catch {
        parsedCart = [];
      }
    }

    if (parsedCart.length > 0 && version !== CART_VERSION) {
      // Migration: re-resolve every line price from the canonical catalog.
      // Fixes stale persisted carts that stored the ×100 (paise) price.
      const migrated = parsedCart.map((item) => {
        const product = products.find(
          (p) => p.id === item.id || p.slug === item.slug
        );
        return product && product.price !== item.price
          ? { ...item, price: product.price }
          : item;
      });
      setItems(migrated);
    } else {
      setItems(parsedCart);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(items));
      localStorage.setItem('cart-version', '3');
    }
  }, [items, isInitialized]);

  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.size === newItem.size &&
          item.color === newItem.color
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      }
      return [...prevItems, newItem];
    });
    setIsOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, isOpen, setIsOpen, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
