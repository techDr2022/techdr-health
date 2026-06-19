import { PrismaClient } from "@prisma/client";
import { resolveDoctorVisibilityUpdate } from "../src/lib/doctor-visibility";

const prisma = new PrismaClient();

async function main() {
  const apply = process.argv.includes("--apply");

  const doctors = await prisma.doctorProfile.findMany({
    select: {
      id: true,
      displayName: true,
      specialty: true,
      isVisible: true,
      approvalStatus: true,
      subscription: { select: { status: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const planned = doctors.filter((doctor) => {
    const shouldBeVisible = resolveDoctorVisibilityUpdate(doctor);
    return shouldBeVisible && !doctor.isVisible;
  });

  if (planned.length === 0) {
    console.log("No doctor visibility updates needed.");
    return;
  }

  console.log(
    apply
      ? `Setting isVisible=true for ${planned.length} approved doctor(s)...`
      : `Dry run: ${planned.length} approved doctor(s) would be made visible. Pass --apply to write.`
  );

  for (const doctor of planned) {
    console.log(
      `- ${doctor.displayName} (${doctor.specialty}) [subscription: ${doctor.subscription?.status ?? "none"}]`
    );
  }

  if (!apply) return;

  const result = await prisma.doctorProfile.updateMany({
    where: { id: { in: planned.map((doctor) => doctor.id) } },
    data: { isVisible: true },
  });

  console.log(`Done. Updated ${result.count} doctor profile(s).`);
}

main()
  .catch((error) => {
    console.error("sync-doctor-visibility failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
