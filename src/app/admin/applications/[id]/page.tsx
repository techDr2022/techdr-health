import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminAccess } from "@/lib/admin-access";
import { ApplicationReviewForm } from "@/components/admin/ApplicationReviewForm";
import { NmcVerificationPanel } from "@/components/admin/NmcVerificationPanel";
import { ApplicationDocumentPreviews } from "@/components/admin/ApplicationDocumentPreviews";
import { loadApplicationDocumentPreviews } from "@/lib/storage-documents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await ensureAdminAccess();
  const application = await prisma.doctorProfile.findUnique({
    where: { id: id },
    include: { subscription: true, user: true },
  });

  if (!application) notFound();

  const documentPreviews = await loadApplicationDocumentPreviews([
    { label: "Medical Registration Certificate", value: application.medRegCertUrl },
    { label: "Degree Certificate", value: application.degreeDocUrl },
    { label: "Government ID", value: application.govIdUrl },
    { label: "Profile Photo", value: application.photoUrl },
    { label: "Cover Photo", value: application.coverPhotoUrl },
  ]);

  return (
    <div className="space-y-6">
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
            ["NMC Verified", application.nmcverified ? "Yes" : "No"],
            ["Consultation Fee", `INR ${application.consultFee}`],
          ]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <ApplicationDocumentPreviews documents={documentPreviews} />
        </CardContent>
      </Card>

      <NmcVerificationPanel
        doctorId={application.id}
        medRegNumber={application.medRegNumber}
        nmcVerified={application.nmcverified}
        nmcVerifiedAt={application.nmcverifiedat?.toISOString() ?? null}
      />

      <ApplicationReviewForm
        applicationId={application.id}
        nmcVerified={application.nmcverified}
        approvalStatus={application.approvalStatus}
      />
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
