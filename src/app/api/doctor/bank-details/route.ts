import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { maskAccountNumber, upsertDoctorBankAccount } from "@/lib/doctor-payouts";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      bankaccount: true,
    },
  });

  if (!doctor) {
    return NextResponse.json({ error: "Doctor profile not found." }, { status: 404 });
  }

  const bank = doctor.bankaccount;
  if (!bank) {
    return NextResponse.json({ bankAccount: null });
  }

  return NextResponse.json({
    bankAccount: {
      accountName: bank.accountname,
      accountNumberMasked: maskAccountNumber(bank.accountnumber),
      ifsc: bank.ifsc,
      verified: bank.verified,
      updatedAt: bank.updatedAt.toISOString(),
    },
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      accountName?: string;
      accountNumber?: string;
      ifsc?: string;
    };

    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        user: { select: { email: true, phone: true } },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found." }, { status: 404 });
    }

    const saved = await upsertDoctorBankAccount({
      doctorId: doctor.id,
      accountName: String(body.accountName ?? ""),
      accountNumber: String(body.accountNumber ?? ""),
      ifsc: String(body.ifsc ?? ""),
      email: doctor.user.email,
      phone: doctor.user.phone,
    });

    return NextResponse.json({
      ok: true,
      bankAccount: {
        accountName: saved.accountname,
        accountNumberMasked: maskAccountNumber(saved.accountnumber),
        ifsc: saved.ifsc,
        verified: saved.verified,
        updatedAt: saved.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save bank details.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
