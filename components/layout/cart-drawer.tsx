'use client';

import { useCart } from "@/lib/cart-context";
import { CloseIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format-price";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, subtotal } = useCart();
  const SHIPPING_THRESHOLD = 10000;
  const router = useRouter();

  if (!isOpen) return null;

  const handleCheckout = () => {
    setIsOpen(false);
    router.push('/checkout/information');
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-[var(--color-soft-cream)] shadow-xl">
        <header className="flex items-center justify-between p-6">
          <h2 className="text-xl font-medium">Your Bag</h2>
          <button onClick={() => setIsOpen(false)} aria-label="Close cart">
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <p>Your bag is empty.</p>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
                  <Image src={item.image.src} alt={item.name} width={80} height={80} className="object-cover" />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.size} / {item.color}</p>
                    <p>{formatPrice(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      <button onClick={() => removeFromCart(item.id)} className="ml-4 text-sm text-red-500">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
...
        <footer className="border-t border-[var(--color-border)] p-6">
          <div className="mb-4">
            <p className="text-sm">Shipping: {subtotal >= SHIPPING_THRESHOLD ? "Free" : formatPrice(SHIPPING_THRESHOLD - subtotal) + " away from free shipping"}</p>
            <div className="mt-1 h-2 w-full bg-gray-200">
              <div className="h-full bg-[var(--color-crimson)]" style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="flex justify-between text-lg font-medium">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Button onClick={handleCheckout} className="mt-6 w-full">Checkout</Button>
        </footer>
      </div>
    </div>
  );
}
