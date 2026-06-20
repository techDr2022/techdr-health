import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FamilyMembersPanel } from "@/components/patient/FamilyMembersPanel";

export const dynamic = "force-dynamic";

export default async function PatientFamilyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "PATIENT") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Family profiles</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage dependents and book consultations on their behalf from your account.
        </p>
      </div>
      <FamilyMembersPanel />
    </div>
  );
}
