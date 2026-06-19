import { prisma } from "@/lib/prisma";
import { ensureAdminAccess } from "@/lib/admin-access";
import { DoctorManagementPanel } from "@/components/admin/DoctorManagementPanel";

export const dynamic = "force-dynamic";

export default async function AdminDoctorsPage() {
  await ensureAdminAccess();
  const doctors = await prisma.doctorProfile.findMany({
    include: { user: { select: { email: true, isActive: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const rows = doctors.map((doctor) => ({
    id: doctor.id,
    userId: doctor.userId,
    displayName: doctor.displayName,
    email: doctor.user.email ?? "n/a",
    specialty: doctor.specialty,
    consultFee: doctor.consultFee,
    isVisible: doctor.isVisible,
    approvalStatus: doctor.approvalStatus,
    photoUrl: doctor.photoUrl,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Doctors</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage doctor accounts, edit full profiles, and control visibility from the founder dashboard.
        </p>
      </div>
      <DoctorManagementPanel doctors={rows} />
    </div>
  );
}
