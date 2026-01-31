"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onChange: (rating: number) => void;
  size?: number;
}

export function StarRating({ rating, onChange, size = 24 }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={size}
            className={cn(
              "transition-colors",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30 hover:text-yellow-400/50"
            )}
          />
        </button>
      ))}
    </div>
  );
}
