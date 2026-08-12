import { StarRating } from "./star-rating";

interface ReviewSummaryProps {
  rating: number;
  count: number;
  onWriteReview: () => void;
}

export function ReviewSummary({ rating, count, onWriteReview }: ReviewSummaryProps) {
    return (
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <StarRating rating={Math.round(rating)} size={20} />
                <span className="text-sm text-ink-muted">({count} reviews)</span>
            </div>
            <button onClick={onWriteReview} className="text-sm font-semibold underline text-ink">
                Write a Review
            </button>
        </div>
    );
}
