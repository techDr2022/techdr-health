"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Role = "PATIENT" | "DOCTOR";
type Mode = "role" | "email";

const emailSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid phone number").optional().or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type EmailRegisterData = z.infer<typeof emailSchema>;

function RoleCard({
  role,
  selected,
  onClick,
}: {
  role: Role;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
        selected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
      }`}
    >
      <span className="text-3xl">{role === "PATIENT" ? "👤" : "🩺"}</span>
      <div>
        <p className="font-display font-[700] text-[14px] text-slate-900">{role === "PATIENT" ? "I am a Patient" : "I am a Doctor"}</p>
        <p className="text-slate-400 text-[11px] mt-0.5 font-body">
          {role === "PATIENT" ? "Book consultations" : "Accept consultations"}
        </p>
      </div>
    </button>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("role");
  const [role, setRole] = useState<Role>("PATIENT");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailRegisterData>({
    resolver: zodResolver(emailSchema),
  });

  async function registerWithEmail(data: EmailRegisterData) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          password: data.password,
          role,
        }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(payload.error || "Registration failed");
        return;
      }

      const loginResult = await signIn("email-password", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (loginResult?.error) {
        toast.success("Account created. Please sign in.");
        router.push("/login");
        return;
      }

      toast.success("Account created successfully!");
      router.push(role === "DOCTOR" ? "/dashboard/doctor" : "/dashboard/patient");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[500px] rounded-2xl border bg-white p-6 md:p-8 shadow-sm">
        {mode === "role" && (
          <div>
            <h1 className="font-display font-[800] text-[28px] text-slate-900 tracking-tight mb-1">Create account</h1>
            <p className="text-slate-500 text-[14px] mb-6 font-body">Select your role to continue</p>
            <div className="flex gap-3 mb-6">
              <RoleCard role="PATIENT" selected={role === "PATIENT"} onClick={() => setRole("PATIENT")} />
              <RoleCard role="DOCTOR" selected={role === "DOCTOR"} onClick={() => setRole("DOCTOR")} />
            </div>
            <Button onClick={() => setMode("email")} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11">
              Continue
            </Button>
          </div>
        )}

        {mode === "email" && (
          <div>
            <button onClick={() => setMode("role")} className="flex items-center gap-1.5 text-slate-400 text-[13px] mb-5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <h2 className="font-display font-[800] text-[24px] text-slate-900 tracking-tight mb-5">Register with email</h2>
            <form onSubmit={handleSubmit((values) => void registerWithEmail(values))} className="space-y-3">
              <div>
                <Input {...register("name")} placeholder="Full name" className="h-11" />
                {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Input {...register("email")} type="email" placeholder="Email address" className="h-11" />
                {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Input {...register("phone")} type="tel" placeholder="Phone (optional)" className="h-11" />
                {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <Input {...register("password")} type="password" placeholder="Password" className="h-11" />
                {errors.password && <p className="text-red-500 text-[11px] mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <Input {...register("confirmPassword")} type="password" placeholder="Confirm password" className="h-11" />
                {errors.confirmPassword && <p className="text-red-500 text-[11px] mt-1">{errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-slate-400 text-[13px] font-body">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-[600] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
