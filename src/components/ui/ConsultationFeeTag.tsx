export function ConsultationFeeTag({ inr }: { inr: number }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-md bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
      <span className="text-xs font-normal text-muted-foreground">From</span>
      ₹{inr.toLocaleString("en-IN")}
    </span>
  );
}
