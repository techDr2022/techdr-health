"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSafeImageSrc } from "@/lib/image";

type BulkImportRowResult = {
  rowNumber: number;
  fullName: string;
  email: string;
  status: "created" | "failed";
  message?: string;
  slug?: string;
};

type BulkImportResponse = {
  total: number;
  created: number;
  failed: number;
  results: BulkImportRowResult[];
};

type BulkImportErrorResponse = {
  error?: string;
  hint?: string;
  detectedHeaders?: string[];
};

export type AdminDoctorRow = {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  specialty: string;
  consultFee: number;
  isVisible: boolean;
  approvalStatus: string;
  photoUrl: string | null;
};

export function DoctorManagementPanel({ doctors }: { doctors: AdminDoctorRow[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<BulkImportResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "techDr",
    specialty: "General Medicine",
    credentials: "MBBS",
    consultFee: "500",
    isVisible: true,
  });

  async function createDoctor() {
    setIsCreating(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          consultFee: Number(form.consultFee),
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error || "Unable to create doctor.");

      setMessage("Doctor added successfully.");
      setUploadError(null);
      setShowForm(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "techDr",
        specialty: "General Medicine",
        credentials: "MBBS",
        consultFee: "500",
        isVisible: true,
      });
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create doctor.");
    } finally {
      setIsCreating(false);
    }
  }

  async function toggleVisibility(doctor: AdminDoctorRow) {
    setBusyId(doctor.id);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/doctors/${doctor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !doctor.isVisible }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error || "Unable to update doctor.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update doctor.");
    } finally {
      setBusyId(null);
    }
  }

  async function uploadBulkDoctors() {
    if (!selectedFile) {
      setMessage("Choose a CSV or Excel file first.");
      return;
    }

    setIsUploading(true);
    setMessage(null);
    setUploadError(null);
    setImportResults(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/admin/doctors/bulk-import", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as
        | (BulkImportResponse & BulkImportErrorResponse)
        | null;

      if (!response.ok) {
        const details = [payload?.error || "Bulk upload failed.", payload?.hint].filter(Boolean).join(" ");
        throw new Error(details);
      }

      if (!payload?.results) throw new Error("Invalid upload response.");

      setImportResults(payload);
      setMessage(`Imported ${payload.created} of ${payload.total} doctors.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (payload.created > 0) router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Bulk upload failed.";
      setUploadError(errorMessage);
      setMessage(null);
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteDoctor(doctor: AdminDoctorRow) {
    const confirmed = window.confirm(`Delete ${doctor.displayName}? If they have bookings, they will be deactivated instead.`);
    if (!confirmed) return;

    setBusyId(doctor.id);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/doctors/${doctor.id}`, { method: "DELETE" });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        softDeleted?: boolean;
        message?: string;
      } | null;
      if (!response.ok) throw new Error(payload?.error || "Unable to delete doctor.");
      setMessage(payload?.message || "Doctor deleted successfully.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete doctor.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-medium text-slate-900">Bulk upload doctors</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload a CSV or Excel file with columns: S.no, planType, entityName, email, phone, password,
              specialty, Credentials, ConsultationFee, and languages.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/api/admin/doctors/bulk-import/template?format=xlsx"
              className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              Download Excel template
            </a>
            <a
              href="/api/admin/doctors/bulk-import/template"
              className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              Download CSV template
            </a>
          </div>
        </div>

        <input
          ref={fileInputRef}
          id="doctor-bulk-upload"
          type="file"
          accept=".csv,.xlsx,.xls,.xlsm,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setSelectedFile(file);
            setImportResults(null);
            setUploadError(null);
            setMessage(null);
          }}
        />

        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="doctor-bulk-upload"
            className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-input bg-white px-3 text-sm font-medium hover:bg-slate-50"
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose file
          </label>
          {selectedFile ? (
            <p className="text-sm text-slate-700">
              Selected: <span className="font-medium">{selectedFile.name}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No file selected</p>
          )}
          <Button type="button" onClick={() => void uploadBulkDoctors()} disabled={isUploading || !selectedFile}>
            {isUploading ? "Uploading..." : "Upload doctors"}
          </Button>
        </div>

        {uploadError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{uploadError}</p>
        ) : null}

        {message ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {message}
          </p>
        ) : null}

        {importResults ? (
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Doctor</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {importResults.results.map((result) => (
                  <tr key={`${result.rowNumber}-${result.email}`} className="border-b last:border-0">
                    <td className="px-3 py-2">{result.rowNumber}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium">{result.fullName || "—"}</p>
                      <p className="text-xs text-muted-foreground">{result.email || "—"}</p>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={result.status === "created" ? "default" : "destructive"}>
                        {result.status === "created" ? "Created" : "Failed"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {result.status === "created" ? result.slug : result.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Add, hide, or remove doctors from the platform.</p>
        <Button type="button" onClick={() => setShowForm((value) => !value)}>
          {showForm ? "Close form" : "Add doctor"}
        </Button>
      </div>

      {showForm ? (
        <div className="grid gap-3 rounded-xl border bg-slate-50 p-4 md:grid-cols-2">
          <Field label="Full name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Password">
            <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <Field label="Specialty">
            <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
          </Field>
          <Field label="Credentials">
            <Input value={form.credentials} onChange={(e) => setForm({ ...form, credentials: e.target.value })} />
          </Field>
          <Field label="Consultation fee (INR)">
            <Input
              type="number"
              value={form.consultFee}
              onChange={(e) => setForm({ ...form, consultFee: e.target.value })}
            />
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
            <Button type="button" onClick={() => void createDoctor()} disabled={isCreating}>
              {isCreating ? "Adding..." : "Create doctor"}
            </Button>
          </div>
        </div>
      ) : null}

      {message && !importResults ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Specialty</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <DoctorPhotoUpload
                    doctor={doctor}
                    disabled={busyId === doctor.id}
                    onUploaded={() => router.refresh()}
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{doctor.displayName}</p>
                  <p className="text-xs text-muted-foreground">{doctor.email}</p>
                </td>
                <td className="px-4 py-3">{doctor.specialty}</td>
                <td className="px-4 py-3">INR {doctor.consultFee.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <Badge variant={doctor.isVisible ? "default" : "secondary"}>
                    {doctor.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-4 py-3">{doctor.approvalStatus}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === doctor.id}
                      onClick={() => void toggleVisibility(doctor)}
                    >
                      {doctor.isVisible ? "Hide" : "Show"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={busyId === doctor.id}
                      onClick={() => void deleteDoctor(doctor)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DoctorPhotoUpload({
  doctor,
  disabled,
  onUploaded,
}: {
  doctor: AdminDoctorRow;
  disabled: boolean;
  onUploaded: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(doctor.photoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPhotoUrl(doctor.photoUrl);
  }, [doctor.photoUrl]);

  async function uploadPhoto(file: File) {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(`/api/admin/doctors/${doctor.id}/photo`, {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as {
        photoUrl?: string;
        error?: string;
      } | null;

      if (!response.ok) throw new Error(payload?.error || "Unable to upload photo.");

      setPhotoUrl(payload?.photoUrl ?? photoUrl);
      onUploaded();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload photo.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="relative h-11 w-11 overflow-hidden rounded-full bg-slate-200">
          <Image
            src={getSafeImageSrc(photoUrl, "/images/placeholders/doctor-avatar.svg")}
            alt={doctor.displayName}
            fill
            className="object-cover"
            sizes="44px"
          />
        </div>
        <input
          ref={inputRef}
          id={`doctor-photo-${doctor.id}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadPhoto(file);
          }}
        />
        <label
          htmlFor={`doctor-photo-${doctor.id}`}
          className={`inline-flex h-8 cursor-pointer items-center rounded-lg border border-input bg-white px-2.5 text-xs font-medium hover:bg-slate-50 ${
            disabled || isUploading ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {isUploading ? "Uploading..." : photoUrl ? "Change" : "Upload"}
        </label>
      </div>
      {error ? <p className="max-w-[140px] text-[11px] text-red-600">{error}</p> : null}
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
