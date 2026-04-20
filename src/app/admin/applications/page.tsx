import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const applications = await prisma.doctorProfile.findMany({
    include: { user: true, subscription: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold">Doctor Applications</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Specialty</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{item.displayName}</p>
                  <p className="text-xs text-muted-foreground">{item.user.email}</p>
                </td>
                <td className="px-4 py-3">{item.subscription?.plan ?? "INDIVIDUAL"}</td>
                <td className="px-4 py-3">{item.specialty}</td>
                <td className="px-4 py-3">
                  <Badge variant={item.approvalStatus === "PENDING" ? "outline" : "default"}>
                    {item.approvalStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {item.createdAt.toLocaleDateString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <Link className="text-sm font-medium text-primary hover:underline" href={`/admin/applications/${item.id}`}>
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
