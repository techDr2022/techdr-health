"use client";

import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { Loader2, Sparkles, Upload } from "lucide-react";
import type { ParsedDoctorResume } from "@/lib/doctor-resume-parse";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const RESUME_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 8 * 1024 * 1024;

type ResumeAutofillUploadProps = {
  disabled?: boolean;
  variant?: "join" | "admin";
  compact?: boolean;
  onParsed: (data: ParsedDoctorResume, filledFields: number) => void;
  onError?: (message: string) => void;
};

const DESCRIPTIONS = {
  join:
    "We analyze your resume and auto-fill name, specialty, experience, credentials, languages, clinic or hospital details, and other profile fields. Review everything before submitting.",
  admin:
    "Upload a doctor resume to auto-fill name, email, phone, specialty, experience, credentials, languages, education, hospitals, bio, and consultation fee. Review all fields before saving.",
};

export function ResumeAutofillUpload({
  disabled = false,
  variant = "join",
  compact = false,
  onParsed,
  onError,
}: ResumeAutofillUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!RESUME_FILE_TYPES.includes(file.type)) {
      onError?.("Upload a PDF, TXT, JPG, PNG, or WEBP resume file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      onError?.("Resume must be under 8MB.");
      return;
    }

    try {
      setIsParsing(true);
      setFileName(file.name);

      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/join/resume-parse", {
        method: "POST",
        body: formData,
      });

      const body = (await response.json()) as {
        data?: ParsedDoctorResume;
        filledFields?: number;
        error?: string;
      };

      if (!response.ok || !body.data) {
        throw new Error(body.error || "Unable to analyze resume.");
      }

      onParsed(body.data, body.filledFields ?? 0);
    } catch (error) {
      setFileName(null);
      const message = error instanceof Error ? error.message : "Unable to analyze resume.";
      onError?.(message);
    } finally {
      setIsParsing(false);
    }
  }

  if (compact) {
    return (
      <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-800">AI Resume Autofill</p>
            <p className="mt-0.5 truncate text-[11px] text-slate-600">
              {fileName
                ? isParsing
                  ? `Analyzing ${fileName}...`
                  : fileName
                : "Optional — auto-fills your profile"}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt,.jpg,.jpeg,.png,.webp,application/pdf,text/plain,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => void handleFileChange(event)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isParsing}
            onClick={() => inputRef.current?.click()}
            className="shrink-0 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
          >
            {isParsing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="md:col-span-2 rounded-2xl border border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50/80 to-cyan-50/50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5" />
            AI Resume Autofill
          </div>
          <Label className="mt-3 block text-base font-semibold text-slate-900">
            Upload resume / CV
          </Label>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{DESCRIPTIONS[variant]}</p>
          {fileName ? (
            <p className="mt-2 text-xs font-medium text-emerald-700">
              {isParsing ? `Analyzing ${fileName}...` : `Last uploaded: ${fileName}`}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt,.jpg,.jpeg,.png,.webp,application/pdf,text/plain,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => void handleFileChange(event)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isParsing}
            onClick={() => inputRef.current?.click()}
            className="border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50"
          >
            {isParsing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
