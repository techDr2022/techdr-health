import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminAccess } from "@/lib/admin-access";
import { DoctorEditForm } from "@/components/admin/DoctorEditForm";
import type { EducationEntry } from "@/types/catalog";

export const dynamic = "force-dynamic";

function parseEducation(value: unknown): EducationEntry[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const degree = typeof row.degree === "string" ? row.degree.trim() : "";
      const institution = typeof row.institution === "string" ? row.institution.trim() : "";
      const yearNum = typeof row.year === "number" ? row.year : Number(String(row.year ?? ""));

      if (!degree || !institution || !Number.isFinite(yearNum)) return null;

      return { degree, institution, year: yearNum };
    })
    .filter((item): item is EducationEntry => item !== null);
}

export default async function AdminDoctorEditPage({ params }: { params: { id: string } }) {
  await ensureAdminAccess();

  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!doctor) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Founder Dashboard</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold">Edit Doctor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update every doctor field without touching code. Profile URL: /doctors/profile/{doctor.slug}
          </p>
        </div>
        <Link href="/admin/doctors" className="text-sm font-medium text-primary hover:underline">
          Back to doctors
        </Link>
      </div>

      <DoctorEditForm
        doctor={{
          id: doctor.id,
          slug: doctor.slug,
          displayName: doctor.displayName,
          email: doctor.user.email ?? "",
          phone: doctor.user.phone ?? "",
          photoUrl: doctor.photoUrl,
          specialty: doctor.specialty,
          credentials: doctor.credentials,
          medRegNumber: doctor.medRegNumber,
          experience: doctor.experience,
          bio: doctor.bio,
          languages: doctor.languages,
          subSpecialties: doctor.subSpecialties,
          hospitalAffils: doctor.hospitalAffils,
          conditions: doctor.conditions,
          education: parseEducation(doctor.education),
          consultFee: doctor.consultFee,
          followUpFee: doctor.followUpFee,
          consultDuration: doctor.consultDuration,
          consultTypes: doctor.consultTypes,
          approvalStatus: doctor.approvalStatus,
          isVisible: doctor.isVisible,
          rejectionReason: doctor.rejectionReason,
          metaTitle: doctor.metaTitle,
          metaDesc: doctor.metaDesc,
        }}
      />
    </div>
  );
}
