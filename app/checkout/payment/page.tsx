'use client';

import { CheckoutShell } from '@/components/checkout/checkout-shell';
import { CheckoutNav } from '@/components/checkout/checkout-nav';
import { useCheckout } from '@/lib/checkout-context';
import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const { data, updateData, resetCheckout } = useCheckout();
  const { clearCart } = useCart();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment
    resetCheckout();
    clearCart();
    router.push('/order-confirmation/123');
  };

  return (
    <CheckoutShell currentStep="payment">
      <form onSubmit={handleSubmit}>
        <h1 className="type-page-title mb-[var(--space-6)]">Payment Method</h1>
        <div className="space-y-[var(--space-4)] mb-[var(--space-8)]">
          <label className="flex items-center p-[var(--space-4)] border border-[var(--color-border)] cursor-pointer transition-colors hover:border-[var(--color-crimson)]">
            <input type="radio" name="payment" value="card" checked={data.paymentMethod === 'card'} onChange={() => updateData({ paymentMethod: 'card' })} className="mr-[var(--space-4)]" />
            <span>Credit/Debit Card</span>
          </label>
          <label className="flex items-center p-[var(--space-4)] border border-[var(--color-border)] cursor-pointer transition-colors hover:border-[var(--color-crimson)]">
            <input type="radio" name="payment" value="cash" checked={data.paymentMethod === 'cash'} onChange={() => updateData({ paymentMethod: 'cash' })} className="mr-[var(--space-4)]" />
            <span>Cash on Delivery</span>
          </label>
        </div>
        <CheckoutNav
          backLabel="Back to Shipping"
          backHref="/checkout/shipping"
          continueLabel="Complete Order"
        />
      </form>
    </CheckoutShell>
  );
}
