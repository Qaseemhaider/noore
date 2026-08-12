import React from 'react';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format-price';

export function OrderSummary() {
  const { items, subtotal } = useCart();
  const shipping = 0; // Simplified for now
  const total = subtotal + shipping;

  return (
    <div className="bg-surface-muted p-6">
      <h2 className="type-h3 mb-4">Order Summary</h2>
      <ul className="mb-4 space-y-4">
        {items.map((item) => (
          <li key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between">
            <div>
              <p className="type-body">{item.name}</p>
              <p className="type-metadata text-ink-muted">
                {item.color} / {item.size} x {item.quantity}
              </p>
            </div>
            <p className="type-body">{formatPrice(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>
      <div className="border-t border-line pt-4 space-y-2">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>{formatPrice(subtotal)}</p>
        </div>
        <div className="flex justify-between">
          <p>Shipping</p>
          <p>{shipping === 0 ? 'Free' : formatPrice(shipping)}</p>
        </div>
        <div className="flex justify-between type-h3 pt-2">
          <p>Total</p>
          <p>{formatPrice(total)}</p>
        </div>
      </div>
    </div>
  );
}
