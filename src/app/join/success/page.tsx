import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Registration Complete",
  description:
    "Your onboarding is complete and your doctor account is approved.",
};

export default function JoinSuccessPage({
  searchParams,
}: {
  searchParams?: { email?: string };
}) {
  const email = searchParams?.email;
  const isEmailConfigured = Boolean(process.env.RESEND_API_KEY);

  return (
    <div className="bg-slate-50 py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <Card className="border-emerald-200">
          <CardContent className="space-y-6 p-8">
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" />
              <h1 className="font-heading text-2xl font-semibold">
                Registration Complete
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Your account has been approved. You can now complete your profile
              and start accepting consultations.
            </p>
            {email ? (
              <p className="rounded-lg bg-slate-50 p-3 text-sm">
                {isEmailConfigured ? "Confirmation email sent to: " : "Registered email: "}
                <strong>{email}</strong>
              </p>
            ) : null}
            <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
              <li>Your account is approved immediately</li>
              <li>
                {isEmailConfigured
                  ? "You receive a confirmation email with login details"
                  : "Enable email settings to send confirmation emails automatically"}
              </li>
              <li>Complete your public profile</li>
              <li>Start accepting online consultations</li>
            </ol>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/join/register">Check Application Status</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
