import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get("featured");
  const limitParam = Number(searchParams.get("limit") ?? "12");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 24) : 12;

  try {
    const doctors = await prisma.doctorProfile.findMany({
      where: {
        isVisible: true,
        approvalStatus: "APPROVED",
      },
      orderBy: [{ createdAt: "desc" }],
      take: limit,
      include: {
        timings: true,
        reviews: { select: { rating: true } },
      },
    });

    const filtered = doctors.filter((doctor) => {
      if (featured !== "true") return true;
      const reviewCount = doctor.reviews.length;
      const rating =
        reviewCount > 0
          ? doctor.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
          : 0;
      return rating >= 4.5 && reviewCount >= 5;
    });

    const payload = filtered.map((doctor) => {
      const reviewCount = doctor.reviews.length;
      const rating =
        reviewCount > 0
          ? doctor.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
          : 4.7;
      const isAvailable = doctor.timings.some((timing) => timing.isOpen);

      return {
        slug: doctor.slug,
        name: doctor.displayName,
        specialty: doctor.specialty,
        credentials: doctor.credentials,
        experience: doctor.experience,
        rating,
        reviewCount,
        consultFee: doctor.consultFee,
        languages: doctor.languages,
        isAvailable,
        initials: doctor.displayName
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        patientCount: Math.max(1000, reviewCount * 4),
        nextSlot: isAvailable ? "Today, 05:30 PM" : "Tomorrow, 10:00 AM",
      };
    });

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
