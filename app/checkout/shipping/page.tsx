'use client';

import { CheckoutShell } from '@/components/checkout/checkout-shell';
import { CheckoutNav } from '@/components/checkout/checkout-nav';
import { useCheckout } from '@/lib/checkout-context';
import { useRouter } from 'next/navigation';

export default function ShippingPage() {
  const { data, updateData } = useCheckout();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/checkout/payment');
  };

  return (
    <CheckoutShell currentStep="shipping">
      <form onSubmit={handleSubmit}>
        <h1 className="type-h2 mb-6">Shipping Method</h1>
        <div className="space-y-4 mb-8">
          <label className="flex items-center p-4 border border-line">
            <input type="radio" name="shipping" value="standard" checked={data.shippingMethod === 'standard'} onChange={() => updateData({ shippingMethod: 'standard' })} className="mr-4" />
            <span>Standard Shipping - Free (3-5 business days)</span>
          </label>
          <label className="flex items-center p-4 border border-line">
            <input type="radio" name="shipping" value="express" checked={data.shippingMethod === 'express'} onChange={() => updateData({ shippingMethod: 'express' })} className="mr-4" />
            <span>Express Shipping - PKR 500 (1-2 business days)</span>
          </label>
        </div>
        <CheckoutNav
          backLabel="Back to Information"
          backHref="/checkout/information"
          continueLabel="Continue to Payment"
        />
      </form>
    </CheckoutShell>
  );
}
