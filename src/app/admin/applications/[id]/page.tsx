import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ApplicationReviewActions } from "@/components/admin/ApplicationReviewActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const application = await prisma.doctorProfile.findUnique({
    where: { id: params.id },
    include: { subscription: true, user: true },
  });

  if (!application) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold">Application Review</h1>
        <Link href="/admin/applications" className="text-sm text-primary hover:underline">
          Back to applications
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard
          title="Entity Details"
          rows={[
            ["Name", application.displayName],
            ["Email", application.user.email],
            ["Phone", application.user.phone || "-"],
            ["Type", "DOCTOR"],
            ["Plan", application.subscription?.plan ?? "INDIVIDUAL"],
            ["Status", application.approvalStatus],
          ]}
        />
        <InfoCard
          title="Medical Profile"
          rows={[
            ["Specialty", application.specialty],
            ["Experience", application.experience.toString()],
            ["Credentials", application.credentials],
            ["Registration Number", application.medRegNumber],
            ["Consultation Fee", `INR ${application.consultFee}`],
          ]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <DocRow label="Medical Registration Certificate" value={application.medRegCertUrl} />
          <DocRow label="Degree Certificate" value={application.degreeDocUrl} />
          <DocRow label="Government ID" value={application.govIdUrl} />
          <DocRow label="Profile Photo" value={application.photoUrl} />
          <DocRow label="Cover Photo" value={application.coverPhotoUrl} />
        </CardContent>
      </Card>

      <ApplicationReviewActions applicationId={application.id} />
    </div>
  );
}

function InfoCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-b pb-2 last:border-0">
            <p className="text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DocRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "Not uploaded"}</p>
    </div>
  );
}
