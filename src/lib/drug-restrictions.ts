import type { ConsultType } from "@prisma/client";

export type DrugSchedule = "H" | "H1" | "X";

export type DrugValidationResult = {
  drugName: string;
  allowed: boolean;
  schedule?: DrugSchedule;
  reason?: string;
};

/** Schedule X — narcotics & psychotropics; never permitted via telemedicine (TPG 2020). */
export const SCHEDULE_X: readonly string[] = [
  "alprazolam",
  "clonazepam",
  "diazepam",
  "lorazepam",
  "midazolam",
  "nitrazepam",
  "chlordiazepoxide",
  "zolpidem",
  "zopiclone",
  "zaleplon",
  "phenobarbital",
  "pentobarbital",
  "morphine",
  "fentanyl",
  "oxycodone",
  "hydromorphone",
  "methadone",
  "buprenorphine",
  "tapentadol",
  "methylphenidate",
  "amphetamine",
  "dexamphetamine",
  "lisdexamfetamine",
  "cannabis",
  "tetrahydrocannabinol",
  "thc",
  "ketamine",
  "sodium oxybate",
  "gamma hydroxybutyrate",
  "ghb",
  "phencyclidine",
  "lysergic",
  "lsd",
  "cocaine",
  "heroin",
  "codeine phosphate", // high-strength opioid preparations
];

/** Schedule H1 — antimicrobials & select Rx drugs; not on first teleconsult with a doctor. */
export const SCHEDULE_H1: readonly string[] = [
  "azithromycin",
  "amoxicillin",
  "amoxiclav",
  "amoxicillin clavulanate",
  "ciprofloxacin",
  "ofloxacin",
  "levofloxacin",
  "moxifloxacin",
  "norfloxacin",
  "doxycycline",
  "minocycline",
  "tetracycline",
  "cephalexin",
  "cefuroxime",
  "ceftriaxone",
  "cefixime",
  "cefpodoxime",
  "metronidazole",
  "tinidazole",
  "ornidazole",
  "clarithromycin",
  "erythromycin",
  "roxithromycin",
  "fluconazole",
  "itraconazole",
  "ketoconazole",
  "voriconazole",
  "acyclovir",
  "valacyclovir",
  "oseltamivir",
  "ivermectin",
  "hydroxychloroquine",
  "chloroquine",
  "artemether",
  "artesunate",
  "rifampicin",
  "isoniazid",
  "ethambutol",
  "pyrazinamide",
  "linezolid",
  "meropenem",
  "piperacillin",
  "tazobactam",
];

/** Schedule H — prescription-only; not via CHAT on first consult. */
export const SCHEDULE_H: readonly string[] = [
  "tramadol",
  "codeine",
  "pregabalin",
  "gabapentin",
  "prednisolone",
  "methylprednisolone",
  "dexamethasone",
  "betamethasone",
  "warfarin",
  "clopidogrel",
  "rivaroxaban",
  "apixaban",
  "insulin",
  "metformin",
  "glibenclamide",
  "gliclazide",
  "sitagliptin",
  "levothyroxine",
  "carbamazepine",
  "valproate",
  "sodium valproate",
  "levetiracetam",
  "phenytoin",
  "olanzapine",
  "risperidone",
  "quetiapine",
  "aripiprazole",
  "amitriptyline",
  "sertraline",
  "fluoxetine",
  "escitalopram",
  "paroxetine",
  "venlafaxine",
  "duloxetine",
  "salbutamol inhaler",
  "budesonide",
  "formoterol",
  "tiotropium",
  "montelukast",
  "amlodipine",
  "telmisartan",
  "losartan",
  "atenolol",
  "metoprolol",
  "propranolol",
  "enalapril",
  "ramipril",
  "atorvastatin",
  "rosuvastatin",
  "simvastatin",
  "finasteride",
  "tamsulosin",
  "sildenafil",
  "tadalafil",
  "isotretinoin",
  "methotrexate",
  "cyclosporine",
  "tacrolimus",
  "allopurinol",
  "colchicine",
  "sumatriptan",
  "domperidone",
  "ondansetron",
  "pantoprazole",
  "omeprazole",
  "rabeprazole",
  "esomeprazole",
];

function normalizeDrugName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function matchSchedule(name: string, keywords: readonly string[]): string | null {
  const normalized = normalizeDrugName(name);
  for (const keyword of keywords) {
    if (normalized.includes(keyword)) return keyword;
  }
  return null;
}

export function validateDrugForConsult(
  drugName: string,
  consultType: ConsultType,
  isFirstConsult: boolean
): DrugValidationResult {
  const trimmed = drugName.trim();
  if (!trimmed) {
    return { drugName: trimmed, allowed: true };
  }

  const scheduleXMatch = matchSchedule(trimmed, SCHEDULE_X);
  if (scheduleXMatch) {
    return {
      drugName: trimmed,
      allowed: false,
      schedule: "X",
      reason: `Schedule X drug (${scheduleXMatch}) cannot be prescribed via telemedicine under TPG 2020.`,
    };
  }

  if (isFirstConsult) {
    const scheduleH1Match = matchSchedule(trimmed, SCHEDULE_H1);
    if (scheduleH1Match) {
      return {
        drugName: trimmed,
        allowed: false,
        schedule: "H1",
        reason: `Schedule H1 drug (${scheduleH1Match}) requires a prior in-person or follow-up consultation with this doctor.`,
      };
    }

    if (consultType === "CHAT") {
      const scheduleHMatch = matchSchedule(trimmed, SCHEDULE_H);
      if (scheduleHMatch) {
        return {
          drugName: trimmed,
          allowed: false,
          schedule: "H",
          reason: `Schedule H drug (${scheduleHMatch}) cannot be prescribed on first CHAT consultation via telemedicine.`,
        };
      }
    }
  }

  return { drugName: trimmed, allowed: true };
}

export function validateMedicinesForConsult(
  medicines: Array<{ name: string }>,
  consultType: ConsultType,
  isFirstConsult: boolean
): DrugValidationResult[] {
  const seen = new Set<string>();
  const results: DrugValidationResult[] = [];

  for (const medicine of medicines) {
    const key = normalizeDrugName(medicine.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    results.push(validateDrugForConsult(medicine.name, consultType, isFirstConsult));
  }

  return results;
}

export function getDisallowedMedicines(results: DrugValidationResult[]): DrugValidationResult[] {
  return results.filter((item) => !item.allowed);
}

export function getDrugWarnings(results: DrugValidationResult[]): DrugValidationResult[] {
  return getDisallowedMedicines(results);
}
