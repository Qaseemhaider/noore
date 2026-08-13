import React from 'react';
import { OrderSummary } from './order-summary';
import { CheckoutSteps } from './checkout-steps';

export function CheckoutShell({ 
  children, 
  currentStep 
}: { 
  children: React.ReactNode; 
  currentStep: 'information' | 'shipping' | 'payment';
}) {
  return (
    <div className="noore-container py-[var(--space-12)] lg:py-[var(--space-16)]">
      <div className="grid grid-cols-1 gap-[var(--space-12)] lg:grid-cols-12">
        <div className="lg:col-span-7">
          <CheckoutSteps currentStep={currentStep} />
          {children}
        </div>
        <div className="lg:col-span-5">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
