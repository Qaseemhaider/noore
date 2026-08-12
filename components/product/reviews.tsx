"use client";
import { useState } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Product } from "@/lib/catalog-data";
import { getReviews, Review } from "@/lib/review-data";
import { ReviewSummary } from "./review-summary";
import { ReviewList } from "./review-list";
import { ReviewForm } from "./review-form";

export function Reviews({ product }: { product: Product }) {
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window === 'undefined') return [];
    return getReviews(product.id);
  });
  const [showForm, setShowForm] = useState(false);

  const loadReviews = () => {
    setReviews(getReviews(product.id));
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;
    
  const totalCount = reviews.length;

  return (
    <section>
      <SectionHeading title="Reviews" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-[var(--space-12)] mt-[var(--space-8)]">
        <div>
           <ReviewSummary 
            rating={avgRating} 
            count={totalCount} 
            onWriteReview={() => setShowForm(!showForm)} 
          />
          <div className="mt-[var(--space-8)]">
            <ReviewList reviews={reviews} />
          </div>
        </div>
        
        {showForm && (
            <div className="bg-[var(--color-surface-muted)] p-[var(--space-6)] self-start">
              <ReviewForm 
                productId={product.id} 
                onReviewAdded={() => {
                  loadReviews();
                  setShowForm(false);
                }} 
              />
            </div>
        )}
      </div>
    </section>
  );
}
