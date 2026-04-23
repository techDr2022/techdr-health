"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FeedbackFormProps = {
  bookingId: string;
  initialRating?: number;
  initialComment?: string;
};

export function FeedbackForm({
  bookingId,
  initialRating = 0,
  initialComment = "",
}: FeedbackFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSuccess(null);
    if (rating < 1 || rating > 5) {
      setError("Please choose a rating between 1 and 5.");
      return;
    }
    try {
      setSubmitting(true);
      const response = await fetch("/api/bookings/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          rating,
          comment,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to submit feedback.");
      }
      setSuccess("Thank you! Your feedback is saved.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-slate-700">Your rating</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={cn(
                "h-10 w-10 rounded-lg border text-sm font-semibold transition",
                rating === value
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">Comments</p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          placeholder="Share your experience..."
          className="mt-2"
        />
      </div>
      <Button onClick={() => void handleSubmit()} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit feedback"}
      </Button>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {success ? <p className="text-sm font-medium text-emerald-600">{success}</p> : null}
    </div>
  );
}
