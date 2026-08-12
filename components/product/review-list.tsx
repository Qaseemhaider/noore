import { Review } from "@/lib/review-data";
import { StarRating } from "./star-rating";

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return <p className="text-sm text-ink-muted">No reviews yet.</p>;
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-line pb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-ink">{review.userName}</p>
            <StarRating rating={review.rating} size={16} />
          </div>
          <p className="text-sm text-ink-muted">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
