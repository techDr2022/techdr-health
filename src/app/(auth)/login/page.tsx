"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Loader2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AuthMode = "choose" | "phone-enter" | "phone-otp" | "email";

const emailSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().trim().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const callbackUrl = "/dashboard";
  const year = new Date().getFullYear();

  const [mode, setMode] = useState<AuthMode>("choose");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function sendOTP() {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "LOGIN" }),
      });
      const data = (await res.json()) as { error?: string; devOtp?: string };
      if (!res.ok) {
        toast.error(data.error || "Could not send OTP");
        if (res.status === 404) {
          toast.message("Use Register for new numbers", {
            description: "This mobile number is not registered yet.",
            action: {
              label: "Go to Register",
              onClick: () => router.push("/register"),
            },
          });
        }
        return;
      }
      setMode("phone-otp");
      startResendTimer();
      setDevOtp(data.devOtp ?? "");
      if (data.devOtp) {
        setOtp(data.devOtp);
        toast.success(`OTP sent to +91 ${phone}. Dev OTP: ${data.devOtp}`);
      } else {
        toast.success(`OTP sent to +91 ${phone}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndLogin() {
    if (otp.length !== 6) return;

    setLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, purpose: "LOGIN" }),
      });
      const data = (await res.json()) as { error?: string; userId?: string; role?: "DOCTOR" | "PATIENT" | "ADMIN" };
      if (!res.ok || !data.userId) {
        setOtpError(data.error || "OTP verification failed");
        return;
      }

      const result = await signIn("phone-otp", {
        phone,
        userId: data.userId,
        redirect: false,
      });

      if (result?.error) {
        setOtpError("Login failed. Please try again.");
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
                onClick={() => setMode("phone-enter")}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-400 transition-all mb-3 text-left"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-none">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-display font-[700] text-[15px] text-slate-900">Continue with Mobile Number</p>
                  <p className="text-slate-400 text-[12px] mt-0.5 font-body">We&apos;ll send a 6-digit OTP</p>
                </div>
              </button>

              <button
                onClick={() => setMode("email")}
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

          {mode === "phone-enter" && (
            <div>
              <button
                onClick={() => setMode("choose")}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-[13px] mb-6 transition-colors font-body"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <h1 className="font-display font-[800] text-[28px] text-slate-900 tracking-tight mb-1">Enter mobile number</h1>
              <p className="text-slate-500 text-[14px] mb-8 font-body">We&apos;ll send a 6-digit OTP to verify your identity</p>

              <div className="space-y-4">
                <div className="flex rounded-xl overflow-hidden border-2 border-slate-200 focus-within:border-blue-500 transition-colors">
                  <div className="flex items-center px-3 bg-slate-50 border-r border-slate-200">
                    <span className="text-[13px] font-[700] text-slate-600 font-body">+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={(e) => e.key === "Enter" && void sendOTP()}
                    placeholder="9876543210"
                    className="flex-1 px-4 py-3.5 text-[16px] font-[600] text-slate-800 placeholder:text-slate-300 outline-none font-body bg-white tracking-wider"
                  />
                </div>
                <Button
                  onClick={sendOTP}
                  disabled={loading || phone.length !== 10}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-display font-[700] text-[15px] rounded-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </div>
            </div>
          )}

          {mode === "phone-otp" && (
            <div>
              <button
                onClick={() => {
                  setMode("phone-enter");
                  setOtp("");
                  setOtpError("");
                }}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-[13px] mb-6 transition-colors font-body"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change number
              </button>
              <h1 className="font-display font-[800] text-[28px] text-slate-900 tracking-tight mb-1">Enter OTP</h1>
              <p className="text-slate-500 text-[14px] mb-8 font-body">
                We sent a 6-digit code to <span className="font-[700] text-slate-800">+91 {phone}</span>
              </p>

              <div className="flex justify-center mb-4">
                <OTPInput
                  value={otp}
                  onChange={(val) => {
                    setOtp(val);
                    setOtpError("");
                    if (val.length === 6) void verifyAndLogin();
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
                            otpError ? "border-red-400 bg-red-50" : ""
                          )}
                        >
                          {slot.char ?? <span className="text-slate-200">•</span>}
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>

              {devOtp ? (
                <p className="text-center text-emerald-600 text-[12px] mb-3 font-body">
                  Dev OTP: <span className="font-semibold tracking-wider">{devOtp}</span>
                </p>
              ) : null}

              {otpError && <p className="text-center text-red-500 text-[13px] mb-4 font-body">{otpError}</p>}

              <Button
                onClick={() => void verifyAndLogin()}
                disabled={loading || otp.length !== 6}
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
                  <button onClick={() => void sendOTP()} disabled={loading} className="text-blue-600 text-[13px] font-[600] hover:underline">
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === "email" && (
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
              </form>

              <p className="mt-4 text-center text-slate-400 text-[13px] font-body">
                No account?{" "}
                <Link href="/register" className="text-blue-600 font-[600] hover:underline">
                  Create one free
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
