import { ensureAdminAccess } from "@/lib/admin-access";
import { listPendingCashMilestones } from "@/lib/doctor-referral";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { markCashMilestonePaidAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  await ensureAdminAccess();
  const pending = await listPendingCashMilestones();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Referral Milestones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cash milestone rewards pending bank transfer or UPI payout.
        </p>
      </div>

      {pending.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No pending cash milestone payouts.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pending cash rewards ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.doctor.displayName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.milestone} referrals · ₹{Number(item.rewardvalue).toLocaleString("en-IN")} ·{" "}
                    {item.doctor.user.email}
                    {item.doctor.user.phone ? ` · ${item.doctor.user.phone}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Awarded {item.awardedat.toLocaleDateString("en-IN")} · Code{" "}
                    {item.doctor.referralcode ?? "—"}
                  </p>
                </div>
                <form action={markCashMilestonePaidAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <Button type="submit" size="sm">
                    Mark paid
                  </Button>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
