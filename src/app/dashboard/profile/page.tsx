import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileEditPanels } from "./profile-edit-panels";

export const dynamic = "force-dynamic";

export default async function DashboardProfilePage() {
  const doctor = await prisma.doctorProfile.findFirst();
  if (!doctor) return <div className="mx-auto max-w-3xl px-4 py-10">No doctor account found.</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-slate-900">Profile & Records</h1>
        <p className="mt-2 text-sm text-slate-600">Manage your public information, reports, and account settings.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Professional Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Line label="Name" value={doctor.displayName} />
            <Line label="Specialty" value={doctor.specialty} />
            <Line label="Credentials" value={doctor.credentials} />
            <Line label="Experience" value={`${doctor.experience} years`} />
            <Line label="Consultation Fee" value={`INR ${doctor.consultFee.toLocaleString("en-IN")}`} />
            <Line label="Languages" value={doctor.languages.join(", ")} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <MiniCard title="Upcoming Sessions" value="3 sessions this week" subtitle="Next today at 6:00 PM" />
          <MiniCard title="Consultation History" value="128 completed visits" subtitle="12 in the last 30 days" />
          <MiniCard title="Health Records" value="26 reports uploaded" subtitle="Last update: Apr 17, 2026" />
        </div>
      </div>

      <ProfileEditPanels />
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
      <p className="text-slate-500">{label}</p>
      <p className="font-medium text-slate-900">{value}</p>
    </div>
  );
}

function MiniCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardContent className="space-y-1 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <p className="text-lg font-semibold text-slate-900">{value}</p>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
