import React from 'react';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format-price';

export function OrderSummary() {
  const { items, subtotal } = useCart();
  const shipping = 0; // Simplified for now
  const total = subtotal + shipping;

  return (
    <aside aria-label="Order summary" className="bg-[var(--color-surface-muted)] p-[var(--space-6)]">
      <h2 className="font-serif text-[var(--text-section-title)] mb-[var(--space-4)]">Order Summary</h2>
      <ul className="mb-[var(--space-4)] space-y-[var(--space-4)]">
        {items.map((item) => (
          <li key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between gap-[var(--space-4)]">
            <div>
              <p className="text-[var(--color-obsidian)]">{item.name}</p>
              <p className="type-meta">
                {item.color} / {item.size} x {item.quantity}
              </p>
            </div>
            <p className="text-[var(--color-obsidian)]">{formatPrice(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>
      <div className="border-t border-[var(--color-border)] pt-[var(--space-4)] space-y-[var(--space-2)]">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>{formatPrice(subtotal)}</p>
        </div>
        <div className="flex justify-between">
          <p>Shipping</p>
          <p>{shipping === 0 ? 'Free' : formatPrice(shipping)}</p>
        </div>
        <div className="flex justify-between font-serif text-[var(--text-section-title)] pt-[var(--space-2)]">
          <p>Total</p>
          <p>{formatPrice(total)}</p>
        </div>
      </div>
    </aside>
  );
}
