"use client";

import { Suspense, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type DoctorOption = {
  slug: string;
  name: string;
};

type UploadedReport = {
  name: string;
  url: string;
};

const TIME_SLOTS = [
  "09:00 AM",
  "10:30 AM",
  "12:00 PM",
  "02:00 PM",
  "04:30 PM",
  "06:00 PM",
];

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function slotToMinutes(slot: string) {
  const match = slot.trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return Number.NaN;
  const [, hh, mm, meridian] = match;
  const hour = Number(hh);
  const minutes = Number(mm);
  const hour24 = meridian === "PM" ? (hour % 12) + 12 : hour % 12;
  return hour24 * 60 + minutes;
}

const fieldClassName =
  "h-11 rounded-xl border-slate-200 bg-slate-50/80 px-3.5 transition-all duration-200 focus-visible:border-cyan-500 focus-visible:ring-4 focus-visible:ring-cyan-100";

const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  phone: z
    .string()
    .min(10, "Enter a valid WhatsApp number.")
    .regex(/^[0-9+\-\s]{10,15}$/, "WhatsApp number should contain only digits and + - spaces."),
  email: z.string().email("Enter a valid email address."),
  doctorSlug: z.string().min(1, "Please select a doctor."),
  appointmentDate: z.string().min(1, "Please choose a preferred date."),
  timeSlot: z.string().min(1, "Please choose a time slot."),
  chiefComplaint: z.string().min(10, "Share a brief description of your concern."),
});

type FormValues = z.infer<typeof schema>;

function ConsultFormInner({ doctors }: { doctors: DoctorOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorFromUrl = searchParams.get("doctor") ?? "";
  const today = useMemo(() => formatDateForInput(new Date()), []);

  const defaults = useMemo(
    () => ({
      doctorSlug: doctorFromUrl || "",
      fullName: "",
      phone: "",
      email: "",
      appointmentDate: "",
      timeSlot: "",
      chiefComplaint: "",
    }),
    [doctorFromUrl]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isUploadingReports, setIsUploadingReports] = useState(false);
  const [uploadedReports, setUploadedReports] = useState<UploadedReport[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleReportUpload(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploadError(null);
    setIsUploadingReports(true);
    try {
      const selectedFiles = Array.from(fileList).slice(0, 5);
      const uploaded = await Promise.all(
        selectedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("report", file);
          const response = await fetch("/api/bookings/lab-report-upload", {
            method: "POST",
            body: formData,
          });
          if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as
              | { error?: string }
              | null;
            throw new Error(payload?.error || `Failed to upload ${file.name}`);
          }
          const payload = (await response.json()) as { url: string };
          return { name: file.name, url: payload.url };
        })
      );
      setUploadedReports((prev) => [...prev, ...uploaded].slice(0, 5));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload reports.");
    } finally {
      setIsUploadingReports(false);
      event.target.value = "";
    }
  }

  async function onSubmit(data: FormValues) {
    setSubmitError(null);
    setSubmitted(false);
    const selectedDoctor = doctors.find((doctor) => doctor.slug === data.doctorSlug);

    const response = await fetch("/api/bookings/acknowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorSlug: data.doctorSlug,
        patientName: data.fullName,
        patientEmail: data.email,
        patientWhatsApp: data.phone,
        appointmentDate: data.appointmentDate,
        timeSlot: data.timeSlot,
        concern: data.chiefComplaint,
        labReportUrls: uploadedReports.map((report) => report.url),
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setSubmitError(payload?.error || "Failed to send booking acknowledgement.");
      return;
    }

    setSubmitted(true);
    const paymentParams = new URLSearchParams({
      doctorSlug: data.doctorSlug,
      doctorName: selectedDoctor?.name ?? data.doctorSlug,
      patientName: data.fullName,
      patientEmail: data.email,
      patientPhone: data.phone,
      appointmentDate: data.appointmentDate,
      timeSlot: data.timeSlot,
      concern: data.chiefComplaint,
      labReportUrls: JSON.stringify(uploadedReports.map((report) => report.url)),
    });
    router.push(`/consult/payment?${paymentParams.toString()}`);
  }

  const selectedSlot = form.watch("timeSlot");
  const selectedDate = form.watch("appointmentDate");
  const visibleSlots = useMemo(() => {
    if (selectedDate !== today) return TIME_SLOTS;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return TIME_SLOTS.filter((slot) => slotToMinutes(slot) >= currentMinutes);
  }, [selectedDate, today]);

  useEffect(() => {
    if (selectedSlot && !visibleSlots.includes(selectedSlot)) {
      form.setValue("timeSlot", "", { shouldValidate: true });
    }
  }, [selectedSlot, visibleSlots, form]);

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
      <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm text-cyan-900">
        <p className="font-semibold">Secure booking form</p>
        <p className="mt-1 text-cyan-800">
          Your doctor and slot preferences are instantly shared with the care team for confirmation.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="doctorSlug" className="text-sm font-semibold text-slate-700">
            Doctor
          </Label>
          <Select
            value={form.watch("doctorSlug") ?? ""}
            onValueChange={(v) => {
              form.setValue("doctorSlug", v ?? "", { shouldValidate: true });
            }}
          >
            <SelectTrigger id="doctorSlug" className={fieldClassName}>
              <SelectValue placeholder="Choose doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.slug} value={d.slug}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={form.formState.errors.doctorSlug?.message} />
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Consultation mode</p>
          <p className="mt-1 text-sm font-semibold text-emerald-900">Video consultation only</p>
          <p className="mt-1 text-xs text-emerald-700">Each appointment slot is 20 minutes.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
            Full name
          </Label>
          <Input id="fullName" {...form.register("fullName")} className={fieldClassName} />
          <FieldError message={form.formState.errors.fullName?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
              WhatsApp number
            </Label>
            <Input id="phone" {...form.register("phone")} className={fieldClassName} />
            <FieldError message={form.formState.errors.phone?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Email
            </Label>
            <Input id="email" type="email" {...form.register("email")} className={fieldClassName} />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="appointmentDate" className="text-sm font-semibold text-slate-700">
            Preferred date
          </Label>
          <div className="relative">
            <CalendarClock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              id="appointmentDate"
              type="date"
              min={today}
              {...form.register("appointmentDate")}
              className={cn(fieldClassName, "pl-10")}
            />
          </div>
          <FieldError message={form.formState.errors.appointmentDate?.message} />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Preferred time slot</Label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {visibleSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => form.setValue("timeSlot", slot, { shouldValidate: true })}
                className={cn(
                  "h-10 rounded-xl border text-sm font-semibold transition-all duration-200",
                  selectedSlot === slot
                    ? "border-cyan-500 bg-cyan-500 text-white shadow-md shadow-cyan-500/30"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"
                )}
              >
                {slot}
              </button>
            ))}
          </div>
          {selectedDate === today && visibleSlots.length === 0 ? (
            <p className="text-xs text-slate-600">No slots left for today. Please choose another date.</p>
          ) : null}
          <FieldError message={form.formState.errors.timeSlot?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chiefComplaint" className="text-sm font-semibold text-slate-700">
            Chief complaint / notes
          </Label>
          <Textarea
            id="chiefComplaint"
            rows={4}
            {...form.register("chiefComplaint")}
            className={cn(fieldClassName, "min-h-28 py-2.5")}
          />
          <FieldError message={form.formState.errors.chiefComplaint?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="labReports" className="text-sm font-semibold text-slate-700">
            Lab reports (optional)
          </Label>
          <Input
            id="labReports"
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp"
            multiple
            onChange={handleReportUpload}
            disabled={isUploadingReports || uploadedReports.length >= 5}
            className={cn(fieldClassName, "file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-cyan-900")}
          />
          <p className="text-xs text-slate-500">
            Upload up to 5 files (PDF, JPG, PNG, WEBP). Max 10MB each.
          </p>
          {isUploadingReports ? <p className="text-xs text-cyan-700">Uploading reports...</p> : null}
          {uploadError ? <p className="text-xs font-medium text-red-600">{uploadError}</p> : null}
          {uploadedReports.length > 0 ? (
            <ul className="space-y-1 text-xs text-slate-700">
              {uploadedReports.map((report) => (
                <li key={report.url} className="truncate">
                  Uploaded: {report.name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="h-12 w-full rounded-xl bg-cyan-500 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-400"
        >
          {form.formState.isSubmitting
            ? "Continuing..."
            : "Continue to payment"}
        </Button>
        {submitError ? <p className="text-sm font-medium text-red-600">{submitError}</p> : null}
        {submitted ? (
          <p className="text-sm font-medium text-emerald-700">
            Booking acknowledged. Email and WhatsApp notifications have been triggered for patient and doctor.
          </p>
        ) : null}
      </form>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </p>
  );
}

export function ConsultForm({ doctors }: { doctors: DoctorOption[] }) {
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted-foreground">Loading booking…</div>}>
      <ConsultFormInner doctors={doctors} />
    </Suspense>
  );
}
