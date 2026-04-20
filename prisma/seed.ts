import { PrismaClient, WeekDay } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SPECIALTIES } from "../src/data/specialties";
import { DOCTORS } from "../src/data/doctors";

const prisma = new PrismaClient();
const DAY_MAP: Record<number, WeekDay> = {
  0: "SUN",
  1: "MON",
  2: "TUE",
  3: "WED",
  4: "THU",
  5: "FRI",
  6: "SAT",
};

async function main() {
  const defaultPasswordHash = await bcrypt.hash("Doctor@123", 10);

  for (let index = 0; index < DOCTORS.length; index++) {
    const d = DOCTORS[index];
    const specialtyName =
      SPECIALTIES.find((x) => x.slug === d.specialtySlug)?.name ??
      d.specialtySlug;
    const email = `${d.slug}@techdrhealth.local`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: d.name,
        phone: `9${String(100000000 + index).slice(-9)}`,
        role: "DOCTOR",
        avatarUrl: d.photoUrl,
        isVerified: true,
        phoneVerified: true,
        emailVerified: true,
        authProvider: "email",
        passwordHash: defaultPasswordHash,
      },
      create: {
        email,
        phone: `9${String(100000000 + index).slice(-9)}`,
        passwordHash: defaultPasswordHash,
        role: "DOCTOR",
        name: d.name,
        avatarUrl: d.photoUrl,
        isVerified: true,
        phoneVerified: true,
        emailVerified: true,
        authProvider: "email",
      },
    });

    const doctorProfile = await prisma.doctorProfile.upsert({
      where: { userId: user.id },
      update: {
        slug: d.slug,
        displayName: d.name,
        photoUrl: d.photoUrl,
        specialty: specialtyName,
        subSpecialties: d.subSpecialties,
        credentials: d.credentials,
        medRegNumber: `MCI-${2020 + index}`,
        experience: d.experience,
        education: d.education as object,
        hospitalAffils: d.hospitalAffils,
        bio: d.bio,
        languages: d.languages,
        conditions: d.conditions,
        consultFee: d.consultFee,
        followUpFee: Math.max(0, Math.round(d.consultFee * 0.4)),
        consultDuration: 15,
        consultTypes: ["VIDEO", "AUDIO", "CHAT"],
        approvalStatus: "APPROVED",
        isVisible: true,
      },
      create: {
        userId: user.id,
        slug: d.slug,
        displayName: d.name,
        credentials: d.credentials,
        specialty: specialtyName,
        subSpecialties: d.subSpecialties,
        medRegNumber: `MCI-${2020 + index}`,
        experience: d.experience,
        bio: d.bio,
        photoUrl: d.photoUrl,
        languages: d.languages,
        consultFee: d.consultFee,
        conditions: d.conditions,
        education: d.education as object,
        hospitalAffils: d.hospitalAffils,
        followUpFee: Math.max(0, Math.round(d.consultFee * 0.4)),
        consultDuration: 15,
        consultTypes: ["VIDEO", "AUDIO", "CHAT"],
        approvalStatus: "APPROVED",
        isVisible: true,
      },
    });

    await prisma.subscription.upsert({
      where: { doctorId: doctorProfile.id },
      update: {
        plan: "INDIVIDUAL",
        status: "ACTIVE",
        priceINR: 4999,
        purchasedAt: new Date(),
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      create: {
        doctorId: doctorProfile.id,
        plan: "INDIVIDUAL",
        status: "ACTIVE",
        priceINR: 4999,
        purchasedAt: new Date(),
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.timeSlot.deleteMany({
      where: { timing: { doctorId: doctorProfile.id } },
    });
    await prisma.doctorTiming.deleteMany({
      where: { doctorId: doctorProfile.id },
    });

    const slotsByDay = d.availabilities.reduce<Record<WeekDay, Array<{ startTime: string; endTime: string }>>>(
      (acc, slot) => {
        const day = DAY_MAP[slot.dayOfWeek];
        if (!day) return acc;
        acc[day] = [...(acc[day] || []), { startTime: slot.startTime, endTime: slot.endTime }];
        return acc;
      },
      { MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [], SUN: [] }
    );

    for (const day of Object.keys(slotsByDay) as WeekDay[]) {
      const daySlots = slotsByDay[day];
      await prisma.doctorTiming.create({
        data: {
          doctorId: doctorProfile.id,
          day,
          isOpen: daySlots.length > 0,
          slots: {
            create: daySlots.map((slot) => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
            })),
          },
        },
      });
    }
  }

  console.log(`Seeded ${DOCTORS.length} doctor users and profiles.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
