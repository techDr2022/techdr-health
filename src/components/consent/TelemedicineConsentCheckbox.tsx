"use client";

import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type TelemedicineConsentCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  className?: string;
  error?: boolean;
};

export function TelemedicineConsentCheckbox({
  checked,
  onCheckedChange,
  id = "telemedicine-consent",
  className,
  error,
}: TelemedicineConsentCheckboxProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3 text-sm",
        error ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50",
        className
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        aria-invalid={error}
        className="mt-0.5"
      />
      <label htmlFor={id} className="cursor-pointer leading-relaxed text-slate-700">
        I consent to receive telemedicine consultation services and understand that my health data
        will be processed as described in the{" "}
        <Link href="/telemedicine-consent" className="font-semibold text-emerald-700 hover:underline" target="_blank">
          Telemedicine Consent
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="font-semibold text-emerald-700 hover:underline" target="_blank">
          Privacy Policy
        </Link>
        . <span className="text-red-600">*</span>
      </label>
    </div>
  );
}
