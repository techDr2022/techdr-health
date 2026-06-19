"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ApplicationReviewActions({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<"APPROVE" | "REJECT" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handle(action: "APPROVE" | "REJECT") {
    try {
      setBusy(action);
      setMessage(null);
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason: action === "REJECT" ? reason : undefined,
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      setMessage(`Application ${action === "APPROVE" ? "approved" : "rejected"} successfully.`);
      router.refresh();
    } catch {
      setMessage("Unable to update application status.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border p-4">
      <p className="text-sm font-medium">Review Decision</p>
      <Input
        placeholder="Rejection reason (required for reject)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={() => handle("APPROVE")} disabled={Boolean(busy)}>
          {busy === "APPROVE" ? "Approving..." : "Approve"}
        </Button>
        <Button
          variant="destructive"
          onClick={() => handle("REJECT")}
          disabled={Boolean(busy) || !reason}
        >
          {busy === "REJECT" ? "Rejecting..." : "Reject"}
        </Button>
      </div>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
