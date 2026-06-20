import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LabTestBookingForm } from "@/components/patient/LabTestBookingForm";

export const dynamic = "force-dynamic";

export default async function PatientLabTestsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "PATIENT") redirect("/dashboard");

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true },
    }),
    prisma.labtestorder.findMany({
      where: { userid: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Book Lab Tests</h1>
        <p className="mt-1 text-sm text-slate-600">
          Choose a panel and complete booking with our partner lab network.
        </p>
      </div>

      <div className="rounded-xl border border-emerald-100 bg-white p-5">
        <LabTestBookingForm defaultPhone={user?.phone ?? ""} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent requests</h2>
        </div>
        {orders.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">No lab test requests yet.</p>
        ) : (
          <ul className="divide-y">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium text-slate-900">{order.panelname}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.city} · {order.createdAt.toLocaleString("en-IN")} · {order.status}
                  </p>
                </div>
                {order.affiliateurl ? (
                  <Link
                    href={order.affiliateurl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    Open partner booking →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
