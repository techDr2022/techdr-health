import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SPECIALTIES } from "../src/data/specialties";
import { calculateDoctorPayout } from "../src/lib/plans";
import { resolveSpecialtySlug } from "../src/lib/doctor-specialty";

const prisma = new PrismaClient();
const CONSULT_DURATION_MINUTES = 20;

const PATIENT_NAMES = [
  "Priya Sharma",
  "Rajesh Kumar",
  "Ananya Iyer",
  "Vikram Singh",
  "Meera Patel",
  "Arjun Reddy",
  "Kavitha Nair",
  "Suresh Menon",
  "Deepa Gupta",
  "Rahul Joshi",
  "Lakshmi Rao",
  "Amit Desai",
  "Sneha Kulkarni",
  "Harish Verma",
  "Pooja Agarwal",
  "Sanjay Malhotra",
  "Nisha Chopra",
  "Karthik Pillai",
  "Divya Bhat",
  "Manoj Shetty",
  "Rekha Das",
  "Gopal Krishnan",
  "Swati Mishra",
  "Abhishek Banerjee",
  "Tanvi Shah",
  "Rohit Saxena",
  "Anjali Mehta",
  "Varun Kapoor",
  "Shalini Dutta",
  "Naveen Choudhury",
];

const COMMENT_TEMPLATES = [
  "Consulted {doctor} online for {condition}. Clear diagnosis and a practical treatment plan — felt heard throughout.",
  "{doctor} took time to explain my {condition} in simple terms. Medication adjustments worked well within a week.",
  "Very professional video consultation with {doctor}. Helpful guidance on managing {condition} at home.",
  "Impressed by how thoroughly {doctor} reviewed my reports before suggesting next steps for {condition}.",
  "{doctor} was empathetic and structured — best teleconsult experience I've had for {condition}.",
  "Follow-up with {doctor} for {condition} was smooth. Prescription and lifestyle advice were easy to follow.",
  "Would recommend {doctor} for anyone dealing with {condition}. Prompt responses and no unnecessary tests.",
  "{doctor} helped me understand triggers related to {condition} and set realistic recovery goals.",
  "Second opinion from {doctor} on {condition} saved me an extra hospital visit. Grateful for the clarity.",
  "Booking was easy and {doctor} joined on time. Solid advice on {condition} with a written summary after.",
  "Chronic {condition} management feels much easier after consulting {doctor}. Regular follow-ups are reassuring.",
  "{doctor} coordinated well with my local physician for {condition}. Seamless care overall.",
  "Clear escalation advice from {doctor} when my {condition} symptoms changed — felt safe consulting online.",
  "Knowledgeable and calm during the consultation. {doctor} addressed every concern about {condition}.",
  "Helpful diet and activity tips from {doctor} alongside treatment for {condition}. Seeing good progress.",
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)]!;
}

function randomRating() {
  const roll = Math.random();
  if (roll < 0.68) return 5;
  if (roll < 0.9) return 4;
  return 3;
}

function randomPastDate(maxDaysAgo: number) {
  const daysAgo = randomInt(7, maxDaysAgo);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomInt(9, 19), randomInt(0, 59), 0, 0);
  return date;
}

function conditionsForSpecialty(specialty: string) {
  const slug = resolveSpecialtySlug(specialty);
  const record = SPECIALTIES.find((item) => item.slug === slug);
  return record?.conditions?.length ? record.conditions : ["general health concerns"];
}

function buildComment(doctorName: string, specialty: string) {
  const condition = pickOne(conditionsForSpecialty(specialty)).toLowerCase();
  const template = pickOne(COMMENT_TEMPLATES);
  return template.replaceAll("{doctor}", doctorName).replaceAll("{condition}", condition);
}

async function ensureSeedPatients(count: number, passwordHash: string) {
  const patients: { id: string; name: string }[] = [];

  for (let index = 0; index < count; index++) {
    const email = `seed-review-patient-${index + 1}@techdrhealth.local`;
    const phone = `8${String(200000000 + index).slice(-9)}`;
    const name = PATIENT_NAMES[index % PATIENT_NAMES.length]!;

    const user = await prisma.user.upsert({
      where: { email },
      update: { name, role: "PATIENT", isVerified: true, emailVerified: true },
      create: {
        email,
        phone,
        passwordHash,
        role: "PATIENT",
        name,
        isVerified: true,
        emailVerified: true,
        authProvider: "email",
      },
      select: { id: true, name: true },
    });

    patients.push(user);
  }

  return patients;
}

async function main() {
  const apply = process.argv.includes("--apply");

  const doctors = await prisma.doctorProfile.findMany({
    select: {
      id: true,
      displayName: true,
      specialty: true,
      consultFee: true,
      consultTypes: true,
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (doctors.length === 0) {
    console.log("No doctors found in the database.");
    return;
  }

  const planned: Array<{
    doctorId: string;
    displayName: string;
    specialty: string;
    existing: number;
    target: number;
    toCreate: number;
  }> = [];

  for (const doctor of doctors) {
    const target = randomInt(5, 20);
    const existing = doctor._count.reviews;
    const toCreate = Math.max(0, target - existing);

    if (toCreate === 0) continue;

    planned.push({
      doctorId: doctor.id,
      displayName: doctor.displayName,
      specialty: doctor.specialty,
      existing,
      target,
      toCreate,
    });
  }

  const totalReviews = planned.reduce((sum, row) => sum + row.toCreate, 0);

  if (planned.length === 0) {
    console.log("All doctors already meet their review targets (5–20 each).");
    return;
  }

  console.log(
    apply
      ? `Creating ${totalReviews} review(s) across ${planned.length} doctor(s)...`
      : `Dry run: would create ${totalReviews} review(s) across ${planned.length} doctor(s). Pass --apply to write.`
  );

  for (const row of planned) {
    console.log(
      `- ${row.displayName} (${row.specialty}): ${row.existing} existing → add ${row.toCreate} (target ${row.target})`
    );
  }

  if (!apply) return;

  const passwordHash = await bcrypt.hash("Patient@123", 10);
  const patients = await ensureSeedPatients(Math.min(30, totalReviews), passwordHash);
  let patientCursor = 0;
  let createdReviews = 0;

  for (const row of planned) {
    const doctor = doctors.find((item) => item.id === row.doctorId);
    if (!doctor) continue;

    const consultType = doctor.consultTypes[0] ?? "VIDEO";
    const fee = calculateDoctorPayout(doctor.consultFee || 499);

    for (let index = 0; index < row.toCreate; index++) {
      const patient = patients[patientCursor % patients.length]!;
      patientCursor += 1;

      const scheduledAt = randomPastDate(540);
      const endsAt = new Date(scheduledAt.getTime() + CONSULT_DURATION_MINUTES * 60 * 1000);

      const booking = await prisma.booking.create({
        data: {
          patientId: patient.id,
          doctorId: row.doctorId,
          scheduledAt,
          endsAt,
          consultType,
          status: "COMPLETED",
          consultFee: doctor.consultFee || 499,
          platformFeeINR: fee.platformFee,
          doctorPayoutINR: fee.doctorPayout,
          gstINR: fee.gstOnPlatformFee,
          totalPatientPays: fee.totalPatientPays,
          payStatus: "CAPTURED",
          payoutStatus: "PAID",
        },
        select: { id: true },
      });

      await prisma.review.create({
        data: {
          bookingId: booking.id,
          doctorId: row.doctorId,
          rating: randomRating(),
          comment: buildComment(row.displayName, row.specialty),
          isPublished: true,
          createdAt: new Date(scheduledAt.getTime() + randomInt(1, 72) * 60 * 60 * 1000),
        },
      });

      createdReviews += 1;
    }
  }

  console.log(`Done. Created ${createdReviews} review(s) for ${planned.length} doctor(s).`);
}

main()
  .catch((error) => {
    console.error("seed-doctor-reviews failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
