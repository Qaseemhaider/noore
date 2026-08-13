'use client';

import { useParams } from 'next/navigation';
import { ButtonLink } from '@/components/ui/button';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId;

  return (
    <div className="noore-container py-[var(--space-16)] text-center">
      <h1 className="type-page-title mb-[var(--space-4)]">Thank You!</h1>
      <p className="mb-[var(--space-8)] text-[var(--color-muted)]">Your order {orderId} has been placed successfully.</p>
      <ButtonLink href="/" variant="primary">
        Continue Shopping
      </ButtonLink>
    </div>
  );
}
