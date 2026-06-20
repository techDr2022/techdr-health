"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Check, Copy, Gift, Link2, Trophy, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { REFERRAL_MILESTONE_TIERS } from "@/lib/doctor-referral";

type ReferralRow = {
  id: string;
  status: "PENDING" | "JOINED" | "REWARDED";
  createdAt: string;
  joinedat: string | null;
  referred: { displayName: string; createdAt: string };
};

type MilestoneRow = {
  id: string;
  milestone: number;
  rewardtype: string;
  rewardvalue: string;
  awardedat: string;
  paid: boolean;
};

type LeaderboardRow = {
  rank: number;
  referralCount: number;
  label: string;
};

type ReferralShareCardProps = {
  referralCode: string;
  patientReferralCode: string;
  referralLink: string;
  patientReferralLink: string;
  successfulJoins: number;
  pendingReferrals: number;
  monthsEarned: number;
  referrals: ReferralRow[];
  milestones: MilestoneRow[];
  nextMilestone: {
    target: number;
    label: string;
    remaining: number;
    completed: boolean;
  };
  totalPendingCashInr: number;
  monthlyReferrals: number;
  monthlyRank: number | null;
  leaderboard: LeaderboardRow[];
  compact?: boolean;
};

function milestoneLabel(type: string, value: string) {
  if (type === "CASH") return `₹${Number(value).toLocaleString("en-IN")} cash`;
  if (type === "BONUS_DAYS") return `${value} bonus days`;
  if (type === "PLAN_UPGRADE") return `${value} plan upgrade`;
  return value;
}

export function ReferralShareCard({
  referralCode,
  patientReferralCode,
  referralLink,
  patientReferralLink,
  successfulJoins,
  pendingReferrals,
  monthsEarned,
  referrals,
  milestones,
  nextMilestone,
  totalPendingCashInr,
  monthlyReferrals,
  monthlyRank,
  leaderboard,
  compact = false,
}: ReferralShareCardProps) {
  const [copiedField, setCopiedField] = useState<
    "code" | "link" | "patientCode" | "patientLink" | null
  >(null);

  async function copyValue(
    value: string,
    field: "code" | "link" | "patientCode" | "patientLink"
  ) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Ignore clipboard errors.
    }
  }

  const progressPercent = nextMilestone.completed
    ? 100
    : Math.min(
        100,
        Math.round((successfulJoins / nextMilestone.target) * 100)
      );

  return (
    <div className={cn("space-y-4", compact ? "" : "space-y-6")}>
      <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white">
        <CardHeader className={compact ? "pb-2" : undefined}>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Gift className="h-5 w-5 text-emerald-600" />
            Refer a Doctor — Earn Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Share your referral link with fellow doctors. Each successful join earns{" "}
            <strong>1 extra month free</strong>, plus milestone bonuses at 3, 5, 10, and 25 referrals.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill icon={<Users className="h-4 w-4" />} label="Successful joins" value={successfulJoins} />
            <StatPill icon={<Gift className="h-4 w-4" />} label="Months earned" value={monthsEarned} />
            {!compact ? (
              <StatPill icon={<Link2 className="h-4 w-4" />} label="Pending" value={pendingReferrals} />
            ) : null}
            {!compact ? (
              <StatPill
                icon={<Wallet className="h-4 w-4" />}
                label="Pending cash"
                value={totalPendingCashInr}
                prefix="₹"
              />
            ) : null}
          </div>

          <div className="rounded-xl border border-emerald-100 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-medium text-slate-800">
                {nextMilestone.completed
                  ? "All milestones unlocked"
                  : `${successfulJoins} of ${nextMilestone.target} referrals to next milestone`}
              </span>
              <span className="text-emerald-700">{nextMilestone.label}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {!nextMilestone.completed && (
              <p className="mt-2 text-xs text-muted-foreground">
                {nextMilestone.remaining} more referral{nextMilestone.remaining === 1 ? "" : "s"} to unlock
              </p>
            )}
          </div>

          <ShareField
            label="Doctor referral code"
            value={referralCode}
            copied={copiedField === "code"}
            onCopy={() => void copyValue(referralCode, "code")}
            mono
          />
          <ShareField
            label="Doctor referral link"
            value={referralLink}
            copied={copiedField === "link"}
            onCopy={() => void copyValue(referralLink, "link")}
            primaryCopy
          />
        </CardContent>
      </Card>

      {!compact && (
        <Card className="border-blue-100 bg-gradient-to-br from-blue-50/60 to-white">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Refer patients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Share your patient referral code so new patients get ₹100 off their first consult (coming
              soon). You earn ₹50 credit per successful patient referral.
            </p>
            <ShareField
              label="Patient referral code"
              value={patientReferralCode}
              copied={copiedField === "patientCode"}
              onCopy={() => void copyValue(patientReferralCode, "patientCode")}
              mono
            />
            <ShareField
              label="Patient referral link"
              value={patientReferralLink}
              copied={copiedField === "patientLink"}
              onCopy={() => void copyValue(patientReferralLink, "patientLink")}
              primaryCopy
            />
          </CardContent>
        </Card>
      )}

      {!compact && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-5 w-5 text-amber-500" />
              Monthly leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {monthlyReferrals > 0 && monthlyRank ? (
              <p className="text-sm text-slate-600">
                Your rank this month: <strong>#{monthlyRank}</strong> with {monthlyReferrals} referral
                {monthlyReferrals === 1 ? "" : "s"}.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No referrals yet this month. Share your link to appear on the leaderboard.
              </p>
            )}
            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground">Leaderboard updates as doctors refer colleagues.</p>
            ) : (
              <ol className="space-y-2">
                {leaderboard.map((entry) => (
                  <li
                    key={entry.rank}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-800">
                      #{entry.rank} {entry.label}
                    </span>
                    <span className="text-muted-foreground">
                      {entry.referralCount} referral{entry.referralCount === 1 ? "" : "s"}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      )}

      {!compact && milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Milestone rewards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {milestones.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.milestone} referrals milestone</p>
                  <p className="text-xs text-slate-500">
                    {milestoneLabel(item.rewardtype, item.rewardvalue)} ·{" "}
                    {new Date(item.awardedat).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <MilestoneStatus type={item.rewardtype} paid={item.paid} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!compact && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All milestones</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {REFERRAL_MILESTONE_TIERS.map((tier) => {
              const earned = milestones.some((item) => item.milestone === tier.milestone);
              return (
                <div
                  key={tier.milestone}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm",
                    earned ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"
                  )}
                >
                  <p className="font-medium">{tier.milestone} referrals</p>
                  <p className="text-xs text-muted-foreground">{tier.label}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {!compact && referrals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your referrals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {referrals.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.referred.displayName}</p>
                  <p className="text-xs text-slate-500">
                    Invited {new Date(item.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <ReferralStatusBadge status={item.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function ShareField({
  label,
  value,
  copied,
  onCopy,
  mono,
  primaryCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  mono?: boolean;
  primaryCopy?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <div className="flex gap-2">
        <Input readOnly value={value} className={cn("text-sm", mono && "font-mono font-semibold tracking-wider")} />
        <Button
          type="button"
          variant={primaryCopy ? "default" : "outline"}
          className={cn("shrink-0", primaryCopy && "bg-emerald-600 text-white hover:bg-emerald-700")}
          onClick={onCopy}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  prefix,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  prefix?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <div className="flex items-center gap-2 text-emerald-700">{icon}</div>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
      <p className="text-xl font-semibold text-slate-900">
        {prefix}
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function MilestoneStatus({ type, paid }: { type: string; paid: boolean }) {
  if (type === "CASH") {
    return (
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-medium",
          paid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
        )}
      >
        {paid ? "Paid" : "Pending payout"}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
      Applied
    </span>
  );
}

function ReferralStatusBadge({ status }: { status: ReferralRow["status"] }) {
  const label =
    status === "REWARDED" ? "Joined — reward granted" : status === "JOINED" ? "Joined" : "Pending";
  const className =
    status === "REWARDED"
      ? "bg-emerald-100 text-emerald-800"
      : status === "JOINED"
        ? "bg-blue-100 text-blue-800"
        : "bg-slate-100 text-slate-600";

  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", className)}>{label}</span>;
}
