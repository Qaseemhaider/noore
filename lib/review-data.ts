export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Temporary localStorage persistence - NOTE: This is for prototype/demonstration only and not suitable for production.
const STORAGE_KEY = 'noore_reviews';

export const getReviews = (productId: string): Review[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  const reviews: Review[] = JSON.parse(stored);
  return reviews.filter(r => r.productId === productId);
};

export const addReview = (review: Review): void => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(STORAGE_KEY);
  const reviews: Review[] = stored ? JSON.parse(stored) : [];
  reviews.push(review);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
};
