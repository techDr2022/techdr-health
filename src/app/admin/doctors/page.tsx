import { prisma } from "@/lib/prisma";
import { ensureAdminAccess } from "@/lib/admin-access";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDoctorsPage() {
  await ensureAdminAccess();
  const doctors = await prisma.doctorProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold">Active Doctors</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Specialty</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Onboarding</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{doctor.displayName}</p>
                  <p className="text-xs text-muted-foreground">{doctor.user.email ?? "n/a"}</p>
                </td>
                <td className="px-4 py-3">{doctor.specialty}</td>
                <td className="px-4 py-3">INR {doctor.consultFee.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <Badge variant={doctor.isVisible ? "default" : "secondary"}>
                    {doctor.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-4 py-3">{doctor.approvalStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
