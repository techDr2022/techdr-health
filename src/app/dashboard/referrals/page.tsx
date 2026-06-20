import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ReferralShareCard } from "@/components/dashboard/ReferralShareCard";
import { Button } from "@/components/ui/button";
import { getDoctorReferralStats, mapReferralStatsForCard } from "@/lib/doctor-referral";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

function mapReferralStats(stats: NonNullable<Awaited<ReturnType<typeof getDoctorReferralStats>>>) {
  return mapReferralStatsForCard(stats, getSiteUrl());
}

export default async function DashboardReferralsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "DOCTOR") redirect("/dashboard/patient");

  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!doctor) {
    return <div className="mx-auto max-w-3xl px-4 py-10">No doctor account found.</div>;
  }

  const stats = await getDoctorReferralStats(doctor.id);
  if (!stats) {
    return <div className="mx-auto max-w-3xl px-4 py-10">Unable to load referral details.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Doctor Referrals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite colleagues, unlock milestone rewards, and climb the monthly leaderboard.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to overview</Link>
        </Button>
      </div>

      <ReferralShareCard {...mapReferralStats(stats)} />
    </div>
  );
}
