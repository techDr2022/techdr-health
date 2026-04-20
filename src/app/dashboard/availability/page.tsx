import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const DAYS: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

export default async function DashboardAvailabilityPage() {
  const doctor = await prisma.doctorProfile.findFirst({
    include: { timings: { include: { slots: true }, orderBy: { day: "asc" } } },
  });
  if (!doctor) return <div className="mx-auto max-w-3xl px-4 py-10">No doctor account found.</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold">Availability</h1>
      <Card>
        <CardHeader>
          <CardTitle>Current Time Slots</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {doctor.timings.length ? (
            doctor.timings.map((timing) => (
              <div key={timing.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <p>{DAYS[timing.day] ?? timing.day}</p>
                <p className="font-medium">
                  {timing.isOpen && timing.slots.length
                    ? timing.slots.map((slot) => `${slot.startTime} - ${slot.endTime}`).join(", ")
                    : "Closed"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No availability slots configured yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
