import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  value,
  className,
  size = 16,
}: {
  value: number;
  className?: string;
  size?: number;
}) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div
      className={cn("flex items-center gap-0.5 text-amber-400", className)}
      aria-label={`Rating ${value.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          width={size}
          height={size}
          fill={i < full || (i === full && half) ? "currentColor" : "none"}
          className={cn(
            i < full || (i === full && half)
              ? "opacity-100"
              : "opacity-25 text-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}
