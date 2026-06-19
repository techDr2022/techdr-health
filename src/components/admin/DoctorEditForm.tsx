"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ConsultType } from "@prisma/client";
import { AdminDoctorPhotoUpload } from "@/components/admin/AdminDoctorPhotoUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatParsedEducation,
  joinParsedList,
  type ParsedDoctorResume,
} from "@/lib/doctor-resume-parse";
import { SPECIALTIES } from "@/data/specialties";
import { normalizeIndianPhoneDigits } from "@/lib/admin-doctor-schema";
import { resolveCanonicalSpecialtyName } from "@/lib/doctor-specialty";
import { ResumeAutofillUpload } from "@/components/join/ResumeAutofillUpload";
import type { EducationEntry } from "@/types/catalog";

export type AdminDoctorEditData = {
  id: string;
  slug: string;
  displayName: string;
  email: string;
  phone: string;
  photoUrl: string | null;
  specialty: string;
  credentials: string;
  medRegNumber: string;
  experience: number;
  bio: string | null;
  languages: string[];
  subSpecialties: string[];
  hospitalAffils: string[];
  conditions: string[];
  education: EducationEntry[];
  consultFee: number;
  followUpFee: number;
  consultDuration: number;
  consultTypes: ConsultType[];
  approvalStatus: string;
  isVisible: boolean;
  rejectionReason: string | null;
  metaTitle: string | null;
  metaDesc: string | null;
};

const CONSULT_TYPES: ConsultType[] = ["VIDEO", "AUDIO", "CHAT"];

function joinList(values: string[]) {
  return values.join(", ");
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatEducationLines(education: EducationEntry[]) {
  return education.map((entry) => `${entry.degree} | ${entry.institution} | ${entry.year}`).join("\n");
}

function parseEducationLines(value: string): EducationEntry[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [degree, institution, yearText] = line.split("|").map((part) => part.trim());
      const year = Number(yearText);
      if (!degree || !institution || !Number.isFinite(year)) return null;
      return { degree, institution, year };
    })
    .filter((entry): entry is EducationEntry => entry !== null);
}

export function DoctorEditForm({ doctor }: { doctor: AdminDoctorEditData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    displayName: doctor.displayName,
    email: doctor.email,
    phone: doctor.phone ?? "",
    password: "",
    specialty: doctor.specialty,
    credentials: doctor.credentials,
    medRegNumber: doctor.medRegNumber,
    experience: String(doctor.experience),
    bio: doctor.bio ?? "",
    languages: joinList(doctor.languages),
    subSpecialties: joinList(doctor.subSpecialties),
    hospitalAffils: joinList(doctor.hospitalAffils),
    conditions: joinList(doctor.conditions),
    education: formatEducationLines(doctor.education),
    consultFee: String(doctor.consultFee),
    followUpFee: String(doctor.followUpFee),
    consultDuration: String(doctor.consultDuration),
    consultTypes: doctor.consultTypes.length > 0 ? doctor.consultTypes : (["VIDEO"] as ConsultType[]),
    approvalStatus: doctor.approvalStatus,
    isVisible: doctor.isVisible,
    rejectionReason: doctor.rejectionReason ?? "",
    metaTitle: doctor.metaTitle ?? "",
    metaDesc: doctor.metaDesc ?? "",
  });

  function applyResumeData(data: ParsedDoctorResume, filledFields: number) {
    setForm((prev) => ({
      ...prev,
      displayName: data.entityName || prev.displayName,
      email: data.email || prev.email,
      phone: data.phone || prev.phone,
      specialty: data.specialty || prev.specialty,
      credentials: data.credentials || prev.credentials,
      medRegNumber: data.medRegNumber || prev.medRegNumber,
      experience: data.experience || prev.experience,
      bio: data.bio || prev.bio,
      languages: joinParsedList(data.languages) || prev.languages,
      subSpecialties: joinParsedList(data.subSpecialties) || prev.subSpecialties,
      hospitalAffils: joinParsedList(data.hospitalAffils) || prev.hospitalAffils,
      conditions: joinParsedList(data.conditions) || prev.conditions,
      education: formatParsedEducation(data.education) || prev.education,
      consultFee: data.consultationFee || prev.consultFee,
    }));
    setMessage(`Resume analyzed — ${filledFields} field(s) auto-filled. Review before saving.`);
  }

  async function saveDoctor() {
    setSaving(true);
    setMessage(null);

    try {
      const phone = normalizeIndianPhoneDigits(form.phone);
      if (phone.length !== 10) {
        setMessage("Enter a valid 10-digit phone number.");
        setSaving(false);
        return;
      }

      const education = parseEducationLines(form.education);
      const consultTypes = form.consultTypes.length > 0 ? form.consultTypes : (["VIDEO"] as ConsultType[]);

      const response = await fetch(`/api/admin/doctors/${doctor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName.trim(),
          email: form.email.trim(),
          phone,
          ...(form.password.trim() ? { password: form.password.trim() } : {}),
          specialty: resolveCanonicalSpecialtyName(form.specialty.trim()),
          credentials: form.credentials.trim(),
          medRegNumber: form.medRegNumber.trim(),
          experience: Number(form.experience),
          bio: form.bio.trim() || null,
          languages: splitList(form.languages),
          subSpecialties: splitList(form.subSpecialties),
          hospitalAffils: splitList(form.hospitalAffils),
          conditions: splitList(form.conditions),
          education,
          consultFee: Number(form.consultFee),
          followUpFee: Number(form.followUpFee),
          consultDuration: Number(form.consultDuration),
          consultTypes,
          approvalStatus: form.approvalStatus,
          isVisible: form.isVisible,
          rejectionReason: form.rejectionReason.trim() || null,
          metaTitle: form.metaTitle.trim() || null,
          metaDesc: form.metaDesc.trim() || null,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error || "Unable to update doctor.");

      setMessage("Doctor profile updated successfully.");
      setForm((prev) => ({ ...prev, password: "" }));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update doctor.");
    } finally {
      setSaving(false);
    }
  }

  function toggleConsultType(type: ConsultType) {
    setForm((prev) => {
      const hasType = prev.consultTypes.includes(type);
      const next = hasType ? prev.consultTypes.filter((item) => item !== type) : [...prev.consultTypes, type];
      return { ...prev, consultTypes: next.length > 0 ? next : prev.consultTypes };
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Profile photo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Used on doctor listings, booking flow, and public profile pages.
        </p>
        <div className="mt-4">
          <AdminDoctorPhotoUpload
            doctorId={doctor.id}
            displayName={form.displayName || doctor.displayName}
            photoUrl={doctor.photoUrl}
            disabled={saving}
            onUploaded={() => router.refresh()}
          />
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Login credentials and contact details.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Display name">
            <Input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            />
          </Field>
          <Field label="Profile slug">
            <Input value={doctor.slug} disabled />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="New password (optional)">
            <Input
              type="password"
              value={form.password}
              placeholder="Leave blank to keep current password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Professional profile</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ResumeAutofillUpload
            variant="admin"
            disabled={saving}
            onParsed={applyResumeData}
            onError={(errorMessage) => setMessage(errorMessage)}
          />
          <Field label="Specialty">
            <select
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/40"
            >
              {SPECIALTIES.map((item) => (
                <option key={item.slug} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Credentials">
            <Input
              value={form.credentials}
              onChange={(e) => setForm({ ...form, credentials: e.target.value })}
            />
          </Field>
          <Field label="Medical registration number">
            <Input
              value={form.medRegNumber}
              onChange={(e) => setForm({ ...form, medRegNumber: e.target.value })}
            />
          </Field>
          <Field label="Experience (years)">
            <Input
              type="number"
              min={0}
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Bio">
              <Textarea
                rows={5}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Languages (comma-separated)">
            <Input
              value={form.languages}
              onChange={(e) => setForm({ ...form, languages: e.target.value })}
            />
          </Field>
          <Field label="Sub-specialties (comma-separated)">
            <Input
              value={form.subSpecialties}
              onChange={(e) => setForm({ ...form, subSpecialties: e.target.value })}
            />
          </Field>
          <Field label="Hospital affiliations (comma-separated)">
            <Input
              value={form.hospitalAffils}
              onChange={(e) => setForm({ ...form, hospitalAffils: e.target.value })}
            />
          </Field>
          <Field label="Conditions treated (comma-separated)">
            <Input
              value={form.conditions}
              onChange={(e) => setForm({ ...form, conditions: e.target.value })}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Education (one per line: Degree | Institution | Year)">
              <Textarea
                rows={4}
                value={form.education}
                placeholder="MBBS | AIIMS Delhi | 2010"
                onChange={(e) => setForm({ ...form, education: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Consultation & fees</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Consultation fee (INR)">
            <Input
              type="number"
              min={0}
              value={form.consultFee}
              onChange={(e) => setForm({ ...form, consultFee: e.target.value })}
            />
          </Field>
          <Field label="Follow-up fee (INR)">
            <Input
              type="number"
              min={0}
              value={form.followUpFee}
              onChange={(e) => setForm({ ...form, followUpFee: e.target.value })}
            />
          </Field>
          <Field label="Consultation duration (minutes)">
            <Input
              type="number"
              min={5}
              value={form.consultDuration}
              onChange={(e) => setForm({ ...form, consultDuration: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Label>Consultation types</Label>
          <div className="mt-2 flex flex-wrap gap-4">
            {CONSULT_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.consultTypes.includes(type)}
                  onChange={() => toggleConsultType(type)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Visibility & approval</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Approval status">
            <select
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={form.approvalStatus}
              onChange={(e) => setForm({ ...form, approvalStatus: e.target.value })}
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 self-end text-sm">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
            />
            Visible on website
          </label>
          <div className="md:col-span-2">
            <Field label="Rejection reason (if rejected)">
              <Textarea
                rows={2}
                value={form.rejectionReason}
                onChange={(e) => setForm({ ...form, rejectionReason: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">SEO</h2>
        <div className="mt-4 grid gap-4">
          <Field label="Meta title">
            <Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
          </Field>
          <Field label="Meta description">
            <Textarea
              rows={2}
              value={form.metaDesc}
              onChange={(e) => setForm({ ...form, metaDesc: e.target.value })}
            />
          </Field>
        </div>
      </section>

      {message ? (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            message.includes("success")
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => void saveDoctor()} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/doctors")}>
          Back to doctors
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
