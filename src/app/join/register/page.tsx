import type { Metadata } from "next";
import { RegisterFlow } from "@/components/join/RegisterFlow";

export const metadata: Metadata = {
  title: "Doctor Registration",
  description:
    "Register as an individual doctor, clinic, or hospital. Upload documents, complete payment, and get verified in 48 hours.",
};

export default function JoinRegisterPage({
  searchParams,
}: {
  searchParams?: { plan?: string };
}) {
  return (
    <div className="bg-slate-50 py-8">
      <RegisterFlow initialPlanId={searchParams?.plan} />
    </div>
  );
}
