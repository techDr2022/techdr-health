import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, CalendarRange, CircleDollarSign, Users } from "lucide-react";
import { ensureAdminAccess } from "@/lib/admin-access";
import { DashboardPeriod, getAdminDashboardData } from "@/lib/admin-dashboard";
import { ExportActions } from "@/components/admin/ExportActions";
import { RevenueTrendChart } from "@/components/admin/RevenueTrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function toPeriod(value?: string): DashboardPeriod {
  if (value === "today" || value === "week" || value === "month") return value;
  return "month";
}

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams?: { period?: string };
}) {
  await ensureAdminAccess();
  const period = toPeriod(searchParams?.period);
  const data = await getAdminDashboardData(period);
  const bookingTotalForMix = Math.max(
    1,
    data.kpis.completedBookings + data.kpis.cancelledBookings + data.kpis.noShowBookings
  );
  const completedPct = Math.round((data.kpis.completedBookings / bookingTotalForMix) * 100);
  const cancelledPct = Math.round((data.kpis.cancelledBookings / bookingTotalForMix) * 100);
  const noShowPct = Math.max(0, 100 - completedPct - cancelledPct);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Founder Analytics</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold">Founder Dashboard</h1>
            <p className="mt-1 text-sm text-slate-300">
              Company-wide operations and financial intelligence for {data.rangeLabel}.
            </p>
          </div>
          <div className="flex gap-2 rounded-xl border border-white/15 bg-white/5 p-1">
            <PeriodLink label="Today" value="today" active={period === "today"} />
            <PeriodLink label="Last 7 Days" value="week" active={period === "week"} />
            <PeriodLink label="This Month" value="month" active={period === "month"} />
          </div>
        </div>
        <ExportActions period={period} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          title="Total Bookings"
          value={String(data.kpis.totalBookings)}
          subtitle={`${data.bookingOps.upcomingNext24h} due in next 24h`}
          changePct={data.comparisons.totalBookingsDeltaPct}
          icon={<CalendarRange className="h-4 w-4 text-cyan-600" />}
        />
        <KpiTile
          title="Capture Rate"
          value={`${data.kpis.captureRate}%`}
          subtitle="Payments captured successfully"
          changePct={data.comparisons.captureRateDeltaPct}
          icon={<CircleDollarSign className="h-4 w-4 text-emerald-600" />}
        />
        <KpiTile
          title="Active Doctors"
          value={String(data.doctorMetrics.activeDoctorsWithBookings)}
          subtitle={`${data.doctorMetrics.visibleDoctors} visible profiles`}
          icon={<Users className="h-4 w-4 text-violet-600" />}
        />
        <KpiTile
          title="Active Alerts"
          value={String(data.alerts.length)}
          subtitle={`${data.bookingOps.pendingPaymentNearSlot} payment risk cases`}
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart data={data.trends.last30Days} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Booking Outcome Mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DonutChart completedPct={completedPct} cancelledPct={cancelledPct} noShowPct={noShowPct} />
            <LegendRow label="Completed" value={`${completedPct}%`} colorClass="bg-emerald-500" />
            <LegendRow label="Cancelled" value={`${cancelledPct}%`} colorClass="bg-amber-500" />
            <LegendRow label="No-show" value={`${noShowPct}%`} colorClass="bg-rose-500" />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Booking Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MetricRow label="Upcoming in next 24h" value={String(data.bookingOps.upcomingNext24h)} />
            <MetricRow label="Uncaptured near slot" value={String(data.bookingOps.pendingPaymentNearSlot)} />
            <MetricRow label="Recent status changes" value={String(data.bookingOps.recentStatusChanges24h)} />
            <InlineLink href="/admin/bookings" label="Open booking operations" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Doctor & Patient Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MetricRow label="Approved doctors" value={String(data.doctorMetrics.approvedDoctors)} />
            <MetricRow label="Utilization per doctor" value={data.doctorMetrics.utilizationPerVisibleDoctor.toFixed(2)} />
            <MetricRow label="Average rating" value={data.doctorMetrics.avgRating.toFixed(2)} />
            <MetricRow label="New patients" value={String(data.patientMetrics.newPatients)} />
            <MetricRow label="Returning patients" value={String(data.patientMetrics.returningPatients)} />
            <InlineLink href="/admin/doctors" label="Open doctor metrics" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Operational Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.alerts.length > 0 ? (
              data.alerts.map((alert) => (
                <Link
                  key={alert.key}
                  href={alert.href}
                  className="flex items-center justify-between rounded-lg border bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100"
                >
                  <span className="pr-3 text-slate-700">{alert.title}</span>
                  <AlertPill severity={alert.severity} count={alert.count} />
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No active alerts in this period.</p>
            )}
            <InlineLink href="/admin/applications" label="Review pending applications" />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Finance Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StackedBar
              items={[
                { label: "Doctor payout", value: data.financeMetrics.doctorPayoutINR, className: "bg-violet-500" },
                { label: "Platform fee", value: data.financeMetrics.platformFeeINR, className: "bg-cyan-500" },
                { label: "GST", value: data.financeMetrics.gstINR, className: "bg-amber-500" },
              ]}
            />
            <div className="space-y-2">
              <MetricRow label="Collections" value={`INR ${data.financeMetrics.totalCollectionsINR.toLocaleString("en-IN")}`} />
              <MetricRow label="Doctor payout liability" value={`INR ${data.financeMetrics.doctorPayoutINR.toLocaleString("en-IN")}`} />
            </div>
            <InlineLink href="/admin/earnings" label="Open earnings report" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payout Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.financeMetrics.payoutStatusBreakdown.length > 0 ? (
              data.financeMetrics.payoutStatusBreakdown.map((item) => (
                <HorizontalMeter
                  key={item.status}
                  label={item.status}
                  value={item.count}
                  max={Math.max(...data.financeMetrics.payoutStatusBreakdown.map((entry) => entry.count))}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No payout records for this period.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/admin/bookings" label="Inspect booking transactions" />
        <QuickLink href="/admin/earnings" label="View earnings reports" />
        <QuickLink href="/admin/doctors" label="Manage doctor network" />
        <QuickLink href="/admin/subscriptions" label="Manage subscriptions" />
        <QuickLink href="/admin/applications" label="Review applications" />
      </section>
    </div>
  );
}

function KpiTile({
  title,
  value,
  subtitle,
  changePct,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  changePct?: number;
  icon: ReactNode;
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <span className="rounded-lg bg-slate-100 p-2">{icon}</span>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500">{subtitle}</p>
          {typeof changePct === "number" ? (
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                changePct >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              {changePct >= 0 ? "+" : ""}
              {changePct}%
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-slate-50 px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function LegendRow({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
        <span className="text-slate-600">{label}</span>
      </div>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border bg-white p-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
    >
      <span className="flex items-center justify-between">
        {label}
        <ArrowRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
      </span>
    </Link>
  );
}

function InlineLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function PeriodLink({
  label,
  value,
  active,
}: {
  label: string;
  value: DashboardPeriod;
  active: boolean;
}) {
  return (
    <Link
      href={`/admin?period=${value}`}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
        active
          ? "bg-white text-slate-900"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function DonutChart({
  completedPct,
  cancelledPct,
  noShowPct,
}: {
  completedPct: number;
  cancelledPct: number;
  noShowPct: number;
}) {
  const gradient = `conic-gradient(#10b981 0 ${completedPct}%, #f59e0b ${completedPct}% ${completedPct + cancelledPct}%, #f43f5e ${completedPct + cancelledPct}% 100%)`;
  return (
    <div className="mx-auto grid h-44 w-44 place-items-center rounded-full" style={{ background: gradient }}>
      <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center">
        <p className="text-xs text-slate-500">Completed</p>
        <p className="text-xl font-semibold text-slate-900">{completedPct}%</p>
      </div>
      <span className="sr-only">No-show {noShowPct}%</span>
    </div>
  );
}

function StackedBar({
  items,
}: {
  items: Array<{ label: string; value: number; className: string }>;
}) {
  const total = Math.max(1, items.reduce((sum, item) => sum + item.value, 0));
  return (
    <div className="space-y-3">
      <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">
        {items.map((item) => (
          <div
            key={item.label}
            className={item.className}
            style={{ width: `${(item.value / total) * 100}%` }}
            title={`${item.label}: INR ${item.value.toLocaleString("en-IN")}`}
          />
        ))}
      </div>
      <div className="space-y-1.5 text-sm">
        {items.map((item) => (
          <LegendRow
            key={item.label}
            label={item.label}
            value={`INR ${item.value.toLocaleString("en-IN")}`}
            colorClass={item.className}
          />
        ))}
      </div>
    </div>
  );
}

function HorizontalMeter({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const widthPct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${widthPct}%` }} />
      </div>
    </div>
  );
}

function AlertPill({
  severity,
  count,
}: {
  severity: "high" | "medium" | "low";
  count: number;
}) {
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
        severity === "high"
          ? "bg-red-100 text-red-700"
          : severity === "medium"
            ? "bg-amber-100 text-amber-700"
            : "bg-slate-200 text-slate-700"
      }`}
    >
      {count}
    </span>
  );
}
