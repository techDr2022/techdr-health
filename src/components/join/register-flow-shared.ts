import type { PlanType } from "@/lib/plans";
import { PLAN_ID_TO_TYPE } from "@/lib/plans";

export type RegisterStep = 1 | 2 | 3 | 4;
export type UploadValue = File | null;

export type FormState = {
  planType: PlanType;
  entityName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  specialty: string;
  subSpecialties: string[];
  experience: string;
  credentials: string;
  medRegNumber: string;
  languages: string[];
  consultationFee: string;
  whatsappNumber: string;
  clinicName: string;
  hospitalName: string;
  address: string;
  city: string;
  pincode: string;
  numberOfDoctors: string;
};

export type UploadState = {
  medRegCertUrl: UploadValue;
  govIdUrl: UploadValue;
  profilePhotoUrl: UploadValue;
  logoUrl: UploadValue;
};

export const LANGUAGES = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Gujarati",
  "Bengali",
];

export const DOCUMENT_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const IMAGE_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const DEFAULT_FORM_STATE: FormState = {
  planType: "INDIVIDUAL",
  entityName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  specialty: "",
  subSpecialties: [],
  experience: "",
  credentials: "",
  medRegNumber: "",
  languages: [],
  consultationFee: "500",
  whatsappNumber: "",
  clinicName: "",
  hospitalName: "",
  address: "",
  city: "",
  pincode: "",
  numberOfDoctors: "1",
};

export const DEFAULT_UPLOADS: UploadState = {
  medRegCertUrl: null,
  govIdUrl: null,
  profilePhotoUrl: null,
  logoUrl: null,
};

export const STEP_LABELS: Record<RegisterStep, string> = {
  1: "Choose Plan",
  2: "Account + Payment",
  3: "Professional Profile",
  4: "Documents + Submit",
};

export function getInitialPlan(initialPlanId?: string): PlanType {
  if (!initialPlanId) return "INDIVIDUAL";
  return PLAN_ID_TO_TYPE[initialPlanId] ?? "INDIVIDUAL";
}

export function getInitialStep(initialPlanId?: string, skipPlanSelection?: boolean): RegisterStep {
  if (skipPlanSelection) return 2;
  if (!initialPlanId) return 1;
  return PLAN_ID_TO_TYPE[initialPlanId] ? 2 : 1;
}

export function getVisibleSteps(skipPlanSelection?: boolean): RegisterStep[] {
  return skipPlanSelection ? [2, 3, 4] : [1, 2, 3, 4];
}
