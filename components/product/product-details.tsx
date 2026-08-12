"use client";

import { useState, useRef, useEffect } from "react";
import { Product } from "@/lib/catalog-data";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Accordion } from "@/components/ui/accordion";
import { StickyAddToCartBar } from "./sticky-add-to-bag";
import { useCart } from "@/lib/cart-context";

interface ProductDetailsProps {
  product: Product;
}

const SizeSelector = ({ sizes, selectedSize, onSelect }: { sizes: string[], selectedSize: string, onSelect: (size: string) => void }) => (
  <div className="space-y-[var(--space-2)]">
    <label className="text-[var(--text-label)] font-sans font-bold uppercase tracking-wider text-[var(--color-obsidian)]">Size</label>
    <div className="flex gap-[var(--space-2)] flex-wrap">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => onSelect(size)}
          aria-pressed={selectedSize === size}
          className={`min-w-[var(--space-12)] h-[var(--space-12)] border transition-all text-[var(--text-body)] px-4 ${selectedSize === size ? "border-[var(--color-crimson)] bg-[var(--color-surface-muted)] font-bold" : "border-[var(--color-border)] hover:border-[var(--color-crimson)]"}`}
        >
          {size}
        </button>
      ))}
    </div>
  </div>
);

const QuantitySelector = ({ quantity, onIncrease, onDecrease }: { quantity: number, onIncrease: () => void, onDecrease: () => void }) => (
  <div className="flex items-center border border-[var(--color-border)] h-[var(--space-12)]">
    <button className="px-[var(--space-4)] h-full text-[var(--text-body)] hover:bg-[var(--color-surface-muted)] flex items-center justify-center min-w-[var(--space-12)]" onClick={onDecrease} aria-label="Decrease quantity">-</button>
    <span className="px-[var(--space-4)] text-[var(--text-body)] font-sans font-bold min-w-[var(--space-10)] text-center">{quantity}</span>
    <button className="px-[var(--space-4)] h-full text-[var(--text-body)] hover:bg-[var(--color-surface-muted)] flex items-center justify-center min-w-[var(--space-12)]" onClick={onIncrease} aria-label="Increase quantity">+</button>
  </div>
);

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedColor, setSelectedColor] = useState(product.availableColors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const purchaseAreaRef = useRef<HTMLDivElement>(null);
  const [isPurchaseAreaVisible, setIsPurchaseAreaVisible] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPurchaseAreaVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    if (purchaseAreaRef.current) {
      observer.observe(purchaseAreaRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
  };

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div className="flex flex-col gap-[var(--space-2)]">
        <h1 className="font-serif text-[var(--text-page-title)] text-[var(--color-obsidian)]">{product.name}</h1>
        <div className="text-[var(--text-price)] text-[var(--color-obsidian)]">
            <Price amount={product.price} />
        </div>
      </div>
      
      <p className="text-[var(--text-body)] text-[var(--color-muted)]">{product.description}</p>

      {/* Purchase Area */}
      <div ref={purchaseAreaRef} className="flex flex-col gap-[var(--space-6)]">
        {/* Color Selector */}
        <div className="space-y-[var(--space-2)]">
            <label className="text-[var(--text-label)] font-sans font-bold uppercase tracking-wider text-[var(--color-obsidian)]">Color: {selectedColor}</label>
            <div className="flex gap-[var(--space-2)]">
            {product.availableColors.map((color) => (
                <button
                key={color}
                onClick={() => setSelectedColor(color)}
                aria-label={`Select color ${color}`}
                aria-pressed={selectedColor === color}
                className={`w-[var(--space-8)] h-[var(--space-8)] rounded-full border transition-all ${selectedColor === color ? "border-[var(--color-crimson)] ring-2 ring-[var(--color-crimson)] ring-offset-2" : "border-[var(--color-border)] hover:border-[var(--color-crimson)]"}`}
                style={{ backgroundColor: color.toLowerCase() === 'black' ? '#121212' : color.toLowerCase() === 'chocolate' ? '#4B3621' : color.toLowerCase() === 'taupe' ? '#A29688' : '#e0c0c0' }}
                />
            ))}
            </div>
        </div>

        {/* Size Selector */}
        <SizeSelector sizes={product.sizes} selectedSize={selectedSize} onSelect={setSelectedSize} />

        {/* Quantity and Add to Bag */}
        <div className="flex items-center gap-[var(--space-4)]">
            <QuantitySelector quantity={quantity} onIncrease={() => setQuantity(quantity + 1)} onDecrease={() => setQuantity(Math.max(1, quantity - 1))} />
            <Button onClick={handleAddToCart} className="flex-1 h-[var(--space-12)] uppercase tracking-widest text-[var(--text-label)]">
            Add to Bag
            </Button>
        </div>
      </div>
      
      {/* Accordions */}
      <div className="mt-[var(--space-6)] border-t border-[var(--color-border)]">
        <Accordion title="Description" defaultOpen>{product.description}</Accordion>
        <Accordion title="Fabric & Material">{product.fabric}</Accordion>
        <Accordion title="Care">{product.care}</Accordion>
        <Accordion title="Shipping & Returns">{product.shippingInfo}</Accordion>
      </div>

      <StickyAddToCartBar 
        product={product}
        isVisible={!isPurchaseAreaVisible}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
