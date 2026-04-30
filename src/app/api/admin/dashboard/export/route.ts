import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { DashboardPeriod, getAdminDashboardData } from "@/lib/admin-dashboard";

function toPeriod(value: string | null): DashboardPeriod {
  if (value === "today" || value === "week" || value === "month") return value;
  return "month";
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const period = toPeriod(request.nextUrl.searchParams.get("period"));
  const data = await getAdminDashboardData(period);

  const lines = [
    ["Metric", "Value"],
    ["Range", data.rangeLabel],
    ["Total Bookings", String(data.kpis.totalBookings)],
    ["Capture Rate (%)", String(data.kpis.captureRate)],
    ["Platform Revenue INR", String(data.kpis.platformRevenueINR)],
    ["Collections INR", String(data.financeMetrics.totalCollectionsINR)],
    ["Approved Doctors", String(data.doctorMetrics.approvedDoctors)],
    ["Visible Doctors", String(data.doctorMetrics.visibleDoctors)],
    ["Unique Patients", String(data.patientMetrics.uniquePatients)],
    ["New Patients", String(data.patientMetrics.newPatients)],
  ];

  const csv = lines.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"founder-dashboard-${period}.csv\"`,
    },
  });
}
