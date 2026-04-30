"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AuthMode = "choose" | "email-password" | "email-otp-enter" | "email-otp-verify";

const emailSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().trim().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = "/dashboard";
  const year = new Date().getFullYear();

  const [mode, setMode] = useState<AuthMode>("choose");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpError, setEmailOtpError] = useState("");
  const [emailDevOtp, setEmailDevOtp] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [magicInProgress, setMagicInProgress] = useState(false);

  async function sendEmailOtp() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!z.string().email().safeParse(normalizedEmail).success) {
      setEmailError("Enter a valid email");
      return;
    }

    setEmailError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "email", email: normalizedEmail, purpose: "LOGIN" }),
      });
      const data = (await res.json()) as { error?: string; devOtp?: string };
      if (!res.ok) {
        toast.error(data.error || "Could not send OTP");
        return;
      }
      setMode("email-otp-verify");
      setEmailOtp("");
      setEmailOtpError("");
      setEmailDevOtp(data.devOtp ?? "");
      startResendTimer();
      if (data.devOtp) {
        setEmailOtp(data.devOtp);
      }
      toast.success(`OTP sent to ${normalizedEmail}`);
    } finally {
      setLoading(false);
    }
  }

  async function sendMagicLink() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!z.string().email().safeParse(normalizedEmail).success) {
      setEmailError("Enter a valid email");
      return;
    }

    setEmailError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "email", email: normalizedEmail, purpose: "LOGIN", method: "magic_link" }),
      });
      const data = (await res.json()) as { error?: string; magicLink?: string };
      if (!res.ok) {
        toast.error(data.error || "Could not send magic link");
        return;
      }
      if (data.magicLink) {
        toast.success("Magic link generated (dev mode). Check API response/logs.");
      } else {
        toast.success(`Magic link sent to ${normalizedEmail}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function verifyEmailOtpAndLogin() {
    if (emailOtp.length !== 6) return;
    setLoading(true);
    setEmailOtpError("");
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "email", email: normalizedEmail, otp: emailOtp, purpose: "LOGIN" }),
      });
      const data = (await res.json()) as { error?: string; userId?: string; role?: "DOCTOR" | "PATIENT" | "ADMIN" };
      if (!res.ok || !data.userId) {
        setEmailOtpError(data.error || "OTP verification failed");
        return;
      }

      const result = await signIn("email-otp", {
        email: normalizedEmail,
        userId: data.userId,
        redirect: false,
      });
      if (result?.error) {
        setEmailOtpError("Login failed. Please try again.");
        return;
      }

      toast.success("Logged in successfully!");
      const destination =
        data.role === "DOCTOR" ? "/dashboard/doctor" : data.role === "ADMIN" ? "/admin" : "/dashboard/patient";
      router.push(destination);
    } finally {
      setLoading(false);
    }
  }

  async function loginWithEmail() {
    const parsed = emailSchema.safeParse({ email, password });
    if (!parsed.success) {
      const issues = parsed.error.issues;
      const emailIssue = issues.find((item) => item.path[0] === "email");
      const passwordIssue = issues.find((item) => item.path[0] === "password");
      setEmailError(emailIssue?.message ?? "");
      setPasswordError(passwordIssue?.message ?? "");
      return;
    }

    setEmailError("");
    setPasswordError("");
    setLoading(true);
    try {
      const result = await signIn("email-password", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });
      if (result?.error) {
        toast.error(result.error === "CredentialsSignin" ? "Incorrect email or password" : result.error);
        return;
      }
      toast.success("Logged in successfully!");
      router.push(callbackUrl);
    } finally {
      setLoading(false);
    }
  }

  function startResendTimer() {
    setResendIn(30);
    const timer = window.setInterval(() => {
      setResendIn((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    const mode = searchParams.get("mode");
    const magicEmail = searchParams.get("email");
    const magicOtp = searchParams.get("otp");
    if (mode !== "magic" || !magicEmail || !magicOtp || magicInProgress) return;

    setMagicInProgress(true);
    setMode("email-otp-verify");
    setEmail(magicEmail);
    setEmailOtp(magicOtp);

    (async () => {
      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: "email", email: magicEmail, otp: magicOtp, purpose: "LOGIN" }),
        });
        const data = (await res.json()) as { error?: string; userId?: string; role?: "DOCTOR" | "PATIENT" | "ADMIN" };
        if (!res.ok || !data.userId) {
          setEmailOtpError(data.error || "Magic link is invalid or expired.");
          setMagicInProgress(false);
          return;
        }

        const result = await signIn("email-otp", {
          email: magicEmail,
          userId: data.userId,
          redirect: false,
        });
        if (result?.error) {
          setEmailOtpError("Sign in failed. Please try OTP login.");
          setMagicInProgress(false);
          return;
        }

        toast.success("Signed in with magic link.");
        const destination =
          data.role === "DOCTOR" ? "/dashboard/doctor" : data.role === "ADMIN" ? "/admin" : "/dashboard/patient";
        router.replace(destination);
      } catch {
        setEmailOtpError("Magic link verification failed.");
        setMagicInProgress(false);
      }
    })();
  }, [magicInProgress, router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:flex lg:w-[460px] flex-col justify-between p-12 bg-blue-950">
        <div>
          <Link href="/" className="inline-flex items-center">
            <Image src="/techdrhealth-logo.png" alt="techDrHealth" width={168} height={44} className="h-9 w-auto" />
          </Link>
        </div>
        <div>
          <h2 className="font-display font-[800] text-[34px] text-white leading-tight tracking-tight">
            Your Health,
            <br />
            Always Connected.
          </h2>
          <p className="text-white/60 mt-4 text-[14px] font-body">
            Secure login for doctors and patients with OTP or password.
          </p>
        </div>
        <p className="text-white/30 text-[12px] font-body">
          © {year} TechDrHealth. Powered by{" "}
          <Link href="https://techdr.in" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            techDr
          </Link>
          .
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px]">
          {mode === "choose" && (
            <div>
              <h1 className="font-display font-[800] text-[28px] text-slate-900 tracking-tight mb-1">Welcome back</h1>
              <p className="text-slate-500 text-[14px] mb-8 font-body">Choose how you&apos;d like to sign in</p>

              <button
                onClick={() => setMode("email-password")}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-400 transition-all text-left"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center flex-none">
                  <Mail className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-display font-[700] text-[15px] text-slate-900">Continue with Email</p>
                  <p className="text-slate-400 text-[12px] mt-0.5 font-body">Sign in with email and password</p>
                </div>
              </button>
              <p className="mt-6 text-center text-slate-400 text-[13px] font-body">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-blue-600 font-[600] hover:underline">
                  Sign up free
                </Link>
              </p>
            </div>
          )}

          {mode === "email-password" && (
            <div>
              <button
                onClick={() => setMode("choose")}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-[13px] mb-6 transition-colors font-body"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <h1 className="font-display font-[800] text-[28px] text-slate-900 tracking-tight mb-1">Sign in</h1>
              <p className="text-slate-500 text-[14px] mb-8 font-body">Enter your email and password to continue</p>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void loginWithEmail();
                }}
                className="space-y-4"
              >
                <div>
                  <Input
                    type="email"
                    placeholder="doctor@example.com"
                    className="h-12 rounded-xl"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (emailError) setEmailError("");
                    }}
                  />
                  {emailError ? <p className="text-red-500 text-[11px] mt-1 font-body">{emailError}</p> : null}
                </div>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-12 rounded-xl pr-12"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {passwordError ? <p className="text-red-500 text-[11px] mt-1 font-body">{passwordError}</p> : null}
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <div className="text-right">
                  <Link href="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-600 hover:text-blue-600 hover:underline"
                    onClick={() => {
                      setPassword("");
                      setPasswordError("");
                      setMode("email-otp-enter");
                    }}
                  >
                    Use email OTP instead
                  </button>
                </div>
              </form>

              <p className="mt-4 text-center text-slate-400 text-[13px] font-body">
                No account?{" "}
                <Link href="/register" className="text-blue-600 font-[600] hover:underline">
                  Create one free
                </Link>
              </p>
            </div>
          )}

          {mode === "email-otp-enter" && (
            <div>
              <button
                onClick={() => setMode("choose")}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-[13px] mb-6 transition-colors font-body"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <h1 className="font-display font-[800] text-[28px] text-slate-900 tracking-tight mb-1">Email OTP login</h1>
              <p className="text-slate-500 text-[14px] mb-8 font-body">Enter your email to receive a 6-digit OTP</p>

              <div className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="doctor@example.com"
                    className="h-12 rounded-xl"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (emailError) setEmailError("");
                    }}
                    onKeyDown={(event) => event.key === "Enter" && void sendEmailOtp()}
                  />
                  {emailError ? <p className="text-red-500 text-[11px] mt-1 font-body">{emailError}</p> : null}
                </div>
                <Button onClick={() => void sendEmailOtp()} disabled={loading} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => void sendMagicLink()}
                  disabled={loading}
                  className="w-full text-sm font-medium text-slate-600 hover:text-blue-600 hover:underline"
                >
                  Send magic sign-in link
                </button>
              </div>
            </div>
          )}

          {mode === "email-otp-verify" && (
            <div>
              <button
                onClick={() => setMode("email-otp-enter")}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-[13px] mb-6 transition-colors font-body"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change email
              </button>
              <h1 className="font-display font-[800] text-[28px] text-slate-900 tracking-tight mb-1">Enter email OTP</h1>
              <p className="text-slate-500 text-[14px] mb-8 font-body">
                We sent a 6-digit code to <span className="font-[700] text-slate-800">{email.trim().toLowerCase()}</span>
              </p>

              <div className="flex justify-center mb-4">
                <OTPInput
                  value={emailOtp}
                  onChange={(val) => {
                    setEmailOtp(val);
                    setEmailOtpError("");
                    if (val.length === 6) void verifyEmailOtpAndLogin();
                  }}
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  render={({ slots }) => (
                    <div className="flex gap-2">
                      {slots.map((slot, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-11 h-13 border-2 rounded-xl flex items-center justify-center font-display font-[800] text-[22px]",
                            slot.isActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white",
                            emailOtpError ? "border-red-400 bg-red-50" : ""
                          )}
                        >
                          {slot.char ?? <span className="text-slate-200">•</span>}
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>

              {emailDevOtp ? (
                <p className="text-center text-emerald-600 text-[12px] mb-3 font-body">
                  Dev OTP: <span className="font-semibold tracking-wider">{emailDevOtp}</span>
                </p>
              ) : null}

              {emailOtpError && <p className="text-center text-red-500 text-[13px] mb-4 font-body">{emailOtpError}</p>}

              <Button
                onClick={() => void verifyEmailOtpAndLogin()}
                disabled={loading || emailOtp.length !== 6}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-display font-[700] text-[15px] rounded-xl mb-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Sign In"
                )}
              </Button>

              <div className="text-center">
                {resendIn > 0 ? (
                  <p className="text-slate-400 text-[13px] font-body">
                    Resend OTP in <span className="font-[700] text-slate-600">{resendIn}s</span>
                  </p>
                ) : (
                  <button
                    onClick={() => void sendEmailOtp()}
                    disabled={loading}
                    className="text-blue-600 text-[13px] font-[600] hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
