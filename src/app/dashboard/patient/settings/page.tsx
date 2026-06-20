import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PrivacySettingsPanel } from "@/components/patient/PrivacySettingsPanel";

export const dynamic = "force-dynamic";

export default async function PatientSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "PATIENT") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Privacy & Data</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your consent preferences and exercise your data rights under DPDPA.
        </p>
      </div>
      <PrivacySettingsPanel />
    </div>
  );
}
