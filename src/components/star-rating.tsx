
"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  variant?: 'display' | 'interactive';
  onRate?: (rating: number) => void;
  className?: string;
  starClassName?: string;
}

const StarRating = ({
  rating,
  totalStars = 5,
  variant = 'display',
  onRate,
  className,
  starClassName,
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleRate = (rate: number) => {
    if (variant === 'interactive' && onRate) {
      onRate(rate);
    }
  };

  const handleMouseEnter = (rate: number) => {
    if (variant === 'interactive') {
      setHoverRating(rate);
    }
  };

  const handleMouseLeave = () => {
    if (variant === 'interactive') {
      setHoverRating(0);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverRating || rating);

        return (
          <Star
            key={starValue}
            className={cn(
              'h-5 w-5',
              isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground',
              variant === 'interactive' && 'cursor-pointer transition-transform hover:scale-125',
              starClassName
            )}
            onClick={() => handleRate(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
