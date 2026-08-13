'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export interface CheckoutData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  shippingMethod: string;
  paymentMethod: string;
}

interface CheckoutContextType {
  data: CheckoutData;
  updateData: (data: Partial<CheckoutData>) => void;
  resetCheckout: () => void;
}

const initialData: CheckoutData = {
  email: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
  phone: '',
  shippingMethod: 'standard', // default
  paymentMethod: 'card', // default
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CheckoutData>(initialData);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('checkoutData');
      setData(saved ? { ...initialData, ...JSON.parse(saved) } : initialData);
    } catch {
      setData(initialData);
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) {
      localStorage.setItem('checkoutData', JSON.stringify(data));
    }
  }, [data]);

  const updateData = (newData: Partial<CheckoutData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const resetCheckout = () => {
    setData(initialData);
    localStorage.removeItem('checkoutData');
  };

  return (
    <CheckoutContext.Provider value={{ data, updateData, resetCheckout }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
