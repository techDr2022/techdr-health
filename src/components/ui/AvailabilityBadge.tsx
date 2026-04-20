import { cn } from "@/lib/utils";

export function AvailabilityBadge({
  available,
}: {
  available: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        available
          ? "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30"
          : "bg-muted text-muted-foreground"
      )}
    >
      {available ? "Available today" : "Limited slots"}
    </span>
  );
}
