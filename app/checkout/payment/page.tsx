'use client';

import { CheckoutShell } from '@/components/checkout/checkout-shell';
import { CheckoutNav } from '@/components/checkout/checkout-nav';
import { useCheckout } from '@/lib/checkout-context';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const { data, updateData, resetCheckout } = useCheckout();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment
    resetCheckout();
    localStorage.removeItem('cart'); // Clear cart
    router.push('/order-confirmation/123');
  };

  return (
    <CheckoutShell currentStep="payment">
      <form onSubmit={handleSubmit}>
        <h1 className="type-h2 mb-6">Payment Method</h1>
        <div className="space-y-4 mb-8">
          <label className="flex items-center p-4 border border-line">
            <input type="radio" name="payment" value="card" checked={data.paymentMethod === 'card'} onChange={() => updateData({ paymentMethod: 'card' })} className="mr-4" />
            <span>Credit/Debit Card</span>
          </label>
          <label className="flex items-center p-4 border border-line">
            <input type="radio" name="payment" value="cash" checked={data.paymentMethod === 'cash'} onChange={() => updateData({ paymentMethod: 'cash' })} className="mr-4" />
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
