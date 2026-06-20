"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BankAccountView = {
  accountName: string;
  accountNumberMasked: string;
  ifsc: string;
  verified: boolean;
  updatedAt: string;
};

export function BankDetailsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existing, setExisting] = useState<BankAccountView | null>(null);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/doctor/bank-details");
        if (!response.ok) throw new Error("Unable to load bank details.");
        const data = (await response.json()) as { bankAccount: BankAccountView | null };
        if (data.bankAccount) {
          setExisting(data.bankAccount);
          setAccountName(data.bankAccount.accountName);
          setIfsc(data.bankAccount.ifsc);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load bank details.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/doctor/bank-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountName, accountNumber, ifsc }),
      });
      const data = (await response.json()) as {
        error?: string;
        bankAccount?: BankAccountView;
      };
      if (!response.ok) {
        throw new Error(data.error || "Unable to save bank details.");
      }
      if (data.bankAccount) {
        setExisting(data.bankAccount);
        setAccountNumber("");
        setSuccess("Bank details saved successfully.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save bank details.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading bank details…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {existing ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            existing.verified
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <p className="inline-flex items-center gap-2 font-semibold">
            {existing.verified ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )}
            {existing.verified ? "Bank account verified" : "Verification pending"}
          </p>
          <p className="mt-1">
            {existing.accountNumberMasked} · {existing.ifsc}
          </p>
          <p className="mt-1 text-xs opacity-80">
            Last updated {new Date(existing.updatedAt).toLocaleString("en-IN")}
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="accountName">Account holder name</Label>
        <Input
          id="accountName"
          value={accountName}
          onChange={(event) => setAccountName(event.target.value)}
          placeholder="As per bank records"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountNumber">Account number</Label>
        <Input
          id="accountNumber"
          value={accountNumber}
          onChange={(event) => setAccountNumber(event.target.value)}
          placeholder={existing ? "Enter again to update account number" : "Bank account number"}
          inputMode="numeric"
          required={!existing}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ifsc">IFSC code</Label>
        <Input
          id="ifsc"
          value={ifsc}
          onChange={(event) => setIfsc(event.target.value.toUpperCase())}
          placeholder="HDFC0001234"
          required
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

      <Button type="submit" disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save bank details"
        )}
      </Button>
    </form>
  );
}
