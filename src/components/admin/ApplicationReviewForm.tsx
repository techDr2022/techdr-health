"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  approveApplication,
  rejectApplication,
  type ReviewApplicationState,
} from "@/app/admin/applications/[id]/actions";

function SubmitButton({
  label,
  pendingLabel,
  variant = "default",
  disabled = false,
}: {
  label: string;
  pendingLabel: string;
  variant?: "default" | "destructive";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending || disabled}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function ApplicationReviewForm({
  applicationId,
  nmcVerified,
  approvalStatus,
}: {
  applicationId: string;
  nmcVerified: boolean;
  approvalStatus: string;
}) {
  const [approveState, approveAction] = useFormState(approveApplication, null);
  const [rejectState, rejectAction] = useFormState(rejectApplication, null);
  const message = getMessage(approveState) || getMessage(rejectState);
  const canApprove = nmcVerified && approvalStatus !== "APPROVED";

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <p className="text-sm font-medium">Review Decision</p>

      {!nmcVerified ? (
        <p className="text-xs text-amber-700">
          Mark NMC registration as verified before approving this application.
        </p>
      ) : null}

      <form action={approveAction} className="flex flex-wrap gap-2">
        <input type="hidden" name="applicationId" value={applicationId} />
        <SubmitButton
          label={approvalStatus === "APPROVED" ? "Already approved" : "Approve"}
          pendingLabel="Approving..."
          disabled={!canApprove}
        />
      </form>

      <form action={rejectAction} className="space-y-3">
        <input type="hidden" name="applicationId" value={applicationId} />
        <Input
          name="reason"
          placeholder="Rejection reason (required for reject)"
          required
        />
        <SubmitButton
          label="Reject"
          pendingLabel="Rejecting..."
          variant="destructive"
        />
      </form>

      {message ? (
        <p className={`text-xs ${message.ok ? "text-emerald-700" : "text-red-600"}`}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}

function getMessage(state: ReviewApplicationState | null) {
  if (!state?.message) return null;
  return { ok: state.ok, text: state.message };
}
