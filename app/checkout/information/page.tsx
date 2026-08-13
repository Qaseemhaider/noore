'use client';

import { CheckoutShell } from '@/components/checkout/checkout-shell';
import { CheckoutField } from '@/components/checkout/checkout-field';
import { CheckoutNav } from '@/components/checkout/checkout-nav';
import { useCheckout } from '@/lib/checkout-context';
import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';

export default function InformationPage() {
  const { data, updateData } = useCheckout();
  const { setIsOpen: setCartIsOpen } = useCart();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/checkout/shipping');
  };

  const handleBackToCart = () => {
    setCartIsOpen(true);
    router.push('/');
  };

  return (
    <CheckoutShell currentStep="information">
      <form onSubmit={handleSubmit}>
        <h1 className="type-page-title mb-[var(--space-6)]">Contact Information</h1>
        <CheckoutField label="Email" type="email" id="email" value={data.email} onChange={(e) => updateData({ email: e.target.value })} required />
        <h2 className="font-serif text-[var(--text-section-title)] mb-[var(--space-4)]">Shipping Address</h2>
        <div className="grid grid-cols-2 gap-4">
          <CheckoutField label="First Name" id="firstName" value={data.firstName} onChange={(e) => updateData({ firstName: e.target.value })} required />
          <CheckoutField label="Last Name" id="lastName" value={data.lastName} onChange={(e) => updateData({ lastName: e.target.value })} required />
        </div>
        <CheckoutField label="Address" id="address" value={data.address} onChange={(e) => updateData({ address: e.target.value })} required />
        <div className="grid grid-cols-3 gap-4">
          <CheckoutField label="City" id="city" value={data.city} onChange={(e) => updateData({ city: e.target.value })} required />
          <CheckoutField label="Province" id="province" value={data.province} onChange={(e) => updateData({ province: e.target.value })} required />
          <CheckoutField label="Postal Code" id="postalCode" value={data.postalCode} onChange={(e) => updateData({ postalCode: e.target.value })} required />
        </div>
        <CheckoutField label="Phone" type="tel" id="phone" value={data.phone} onChange={(e) => updateData({ phone: e.target.value })} required />
        <CheckoutNav
          backLabel="Back to Cart"
          backOnClick={handleBackToCart}
          continueLabel="Continue to Shipping"
        />
      </form>
    </CheckoutShell>
  );
}
