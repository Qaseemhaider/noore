'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId;

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="type-h2 mb-4">Thank You!</h1>
      <p className="type-body mb-8">Your order {orderId} has been placed successfully.</p>
      <Link href="/" className="bg-crimson text-white px-8 py-3">
        Continue Shopping
      </Link>
    </div>
  );
}
