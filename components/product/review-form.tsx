"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StarRating } from "./star-rating";

interface ReviewFormProps {
  productId: string;
  onReviewAdded: () => void;
}

export function ReviewForm({ productId, onReviewAdded }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || name.trim() === "" || comment.trim() === "") {
      setError("Please fill in all fields.");
      return;
    }

    // Add to storage
    import("@/lib/review-data").then(({ addReview }) => {
        addReview({
            id: Date.now().toString(),
            productId,
            userName: name,
            rating,
            comment,
            createdAt: new Date().toISOString(),
        });
        setName("");
        setComment("");
        setRating(0);
        setError("");
        onReviewAdded();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-line rounded">
      <h3 className="font-semibold text-ink">Write a Review</h3>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <div>
        <label className="block text-sm font-medium text-ink-muted mb-1">Rating</label>
        <StarRating rating={rating} interactive onRatingChange={setRating} />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink-muted mb-1">Name</label>
        <input 
          id="name"
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-line rounded text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-ink-muted mb-1">Review</label>
        <textarea 
          id="comment"
          value={comment} 
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border border-line rounded text-sm"
          rows={3}
          required
        />
      </div>

      <Button type="submit">Submit Review</Button>
    </form>
  );
}
