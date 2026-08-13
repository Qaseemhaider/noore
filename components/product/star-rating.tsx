import { StarIcon } from "@/components/icons";

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: number;
}

export function StarRating({ rating, interactive = false, onRatingChange, size = 20 }: StarRatingProps) {
  return (
    <div className="flex gap-1" role={interactive ? "radiogroup" : "img"} aria-label={interactive ? "Rate this product" : `${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        interactive ? (
          <button
            key={star}
            type="button"
            className={`transition-colors ${star <= rating ? 'text-[var(--color-obsidian)]' : 'text-[var(--color-border)] hover:text-[var(--color-obsidian)]'}`}
            onClick={() => onRatingChange?.(star)}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <StarIcon width={size} height={size} />
          </button>
        ) : (
          <StarIcon 
            key={star} 
            className={star <= rating ? 'text-[var(--color-obsidian)]' : 'text-[var(--color-border)]'} 
            width={size} 
            height={size}
          />
        )
      ))}
    </div>
  );
}
