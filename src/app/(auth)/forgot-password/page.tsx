"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendResetOtp() {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "RESET" }),
      });
      const body = (await response.json()) as { error?: string; devOtp?: string };
      if (!response.ok) {
        setError(body.error || "Unable to send OTP.");
        return;
      }

      if (body.devOtp) {
        setOtp(body.devOtp);
        toast.success(`OTP sent. Dev OTP: ${body.devOtp}`);
      } else {
        toast.success("OTP sent to your mobile number.");
      }
      setStep(2);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, newPassword, confirmPassword }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(body.error || "Unable to reset password.");
        return;
      }

      toast.success("Password updated successfully.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900">Forgot password</h1>
            <p className="text-sm text-slate-600">Enter your registered mobile number to receive reset OTP.</p>
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              className="h-11"
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button onClick={() => void sendResetOtp()} disabled={loading} className="w-full h-11">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900">Reset password</h1>
            <p className="text-sm text-slate-600">Enter OTP and set your new password.</p>
            <div className="flex justify-center">
              <OTPInput
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  setError("");
                }}
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                render={({ slots }) => (
                  <div className="flex gap-2">
                    {slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex h-11 w-10 items-center justify-center rounded-lg border-2 text-lg font-semibold",
                          slot.isActive ? "border-blue-500 bg-blue-50" : "border-slate-200"
                        )}
                      >
                        {slot.char ?? <span className="text-slate-300">•</span>}
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
            <Input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New password"
              className="h-11"
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              className="h-11"
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button onClick={() => void resetPassword()} disabled={loading} className="w-full h-11">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
