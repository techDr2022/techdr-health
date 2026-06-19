import { PrismaClient } from "@prisma/client";
import {
  defaultConditionsForSpecialty,
  resolveCanonicalSpecialtyName,
  resolveSpecialtySlug,
} from "../src/lib/doctor-specialty";

const prisma = new PrismaClient();

type PlannedUpdate = {
  id: string;
  displayName: string;
  fromSpecialty: string;
  toSpecialty: string;
  backfillConditions: boolean;
};

async function main() {
  const apply = process.argv.includes("--apply");
  const doctors = await prisma.doctorProfile.findMany({
    select: {
      id: true,
      displayName: true,
      specialty: true,
      conditions: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const planned: PlannedUpdate[] = [];

  for (const doctor of doctors) {
    const canonical = resolveCanonicalSpecialtyName(doctor.specialty);
    const specialtyChanged = canonical !== doctor.specialty.trim();
    const shouldBackfillConditions =
      doctor.conditions.length === 0 && defaultConditionsForSpecialty(canonical).length > 0;

    if (specialtyChanged || shouldBackfillConditions) {
      planned.push({
        id: doctor.id,
        displayName: doctor.displayName,
        fromSpecialty: doctor.specialty,
        toSpecialty: canonical,
        backfillConditions: shouldBackfillConditions,
      });
    }
  }

  if (planned.length === 0) {
    console.log("All doctor specialties are already normalized.");
    return;
  }

  console.log(
    apply
      ? `Applying updates for ${planned.length} doctor profile(s)...`
      : `Dry run: ${planned.length} doctor profile(s) would be updated. Pass --apply to write changes.`
  );

  for (const item of planned) {
    const slug = resolveSpecialtySlug(item.toSpecialty);
    console.log(
      `- ${item.displayName}: "${item.fromSpecialty}" -> "${item.toSpecialty}" (${slug})${
        item.backfillConditions ? " + default conditions" : ""
      }`
    );
  }

  if (!apply) return;

  let updated = 0;
  for (const item of planned) {
    await prisma.doctorProfile.update({
      where: { id: item.id },
      data: {
        specialty: item.toSpecialty,
        ...(item.backfillConditions
          ? { conditions: defaultConditionsForSpecialty(item.toSpecialty) }
          : {}),
      },
    });
    updated += 1;
  }

  console.log(`Done. Updated ${updated} doctor profile(s).`);
}

main()
  .catch((error) => {
    console.error("normalize-doctor-specialties failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
