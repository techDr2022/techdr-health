import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { HealthRecordsVault } from "@/components/patient/HealthRecordsVault";

export const dynamic = "force-dynamic";

export default async function PatientHealthRecordsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "PATIENT") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Health Records</h1>
        <p className="mt-1 text-sm text-slate-600">
          Store lab reports, prescriptions, and scans securely. Share with doctors during consultations.
        </p>
      </div>
      <HealthRecordsVault />
    </div>
  );
}
