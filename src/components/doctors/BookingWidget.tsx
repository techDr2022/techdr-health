"use client";

import type { DoctorRecord } from "@/types/catalog";
import { Calendar } from "lucide-react";
import { BookNowModal } from "@/components/doctors/BookNowModal";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function BookingWidget({ doctor }: { doctor: DoctorRecord }) {
  const slots = [...doctor.availabilities].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
  );

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-lg ring-1 ring-black/5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#0EA5E9]/10 p-3 text-[#0EA5E9]">
          <Calendar className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h2 className="font-heading text-xl font-semibold text-[#0A1628]">
            Availability
          </h2>
          <p className="text-sm text-muted-foreground">
                    Consultation fee · ₹{doctor.consultFee.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
      <ul className="mt-6 space-y-3 max-h-52 overflow-auto pr-1">
        {slots.map((s, idx) => (
          <li
            key={`${s.dayOfWeek}-${s.startTime}-${idx}`}
            className="flex items-center justify-between rounded-lg bg-[#F8FAFC] px-3 py-2 text-sm"
          >
            <span className="font-medium">{DAYS[s.dayOfWeek] ?? s.dayOfWeek}</span>
            <span className="text-muted-foreground">
              {s.startTime}–{s.endTime}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6 grid gap-3">
        <BookNowModal
          doctor={doctor}
          triggerLabel="Book video consultation"
          triggerSize="lg"
          triggerClassName="w-full"
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
        Slots shown in IST. Each consultation slot is 20 minutes and the exact
        appointment time is confirmed after payment authorization.
      </p>
    </div>
  );
}
