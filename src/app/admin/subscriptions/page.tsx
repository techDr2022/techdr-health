import { prisma } from "@/lib/prisma";
import { ensureAdminAccess } from "@/lib/admin-access";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  await ensureAdminAccess();
  const subscriptions = await prisma.subscription.findMany({
    include: { doctor: { select: { displayName: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold">Subscriptions</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Starts</th>
              <th className="px-4 py-3">Expires</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="border-b last:border-0">
                <td className="px-4 py-3">{sub.plan}</td>
                <td className="px-4 py-3">
                  <p>DOCTOR</p>
                  <p className="text-xs text-muted-foreground">{sub.doctor.displayName}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={sub.status === "ACTIVE" ? "default" : "outline"}>
                    {sub.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">INR {sub.priceINR.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">{sub.activatedAt ? sub.activatedAt.toLocaleDateString("en-IN") : "-"}</td>
                <td className="px-4 py-3">{sub.expiresAt ? sub.expiresAt.toLocaleDateString("en-IN") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
