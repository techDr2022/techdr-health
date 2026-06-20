export type LabTestPanel = {
  id: string;
  name: string;
  tests: string[];
  priceHint: string;
  description: string;
};

export const LAB_TEST_PANELS: LabTestPanel[] = [
  {
    id: "basic",
    name: "Basic Health Check",
    tests: ["Complete Blood Count", "Fasting Blood Sugar", "Lipid Profile", "Liver Function Test"],
    priceHint: "From ₹799",
    description: "Essential screening for overall wellness.",
  },
  {
    id: "diabetes",
    name: "Diabetes Care Panel",
    tests: ["Fasting Blood Sugar", "Post Prandial Sugar", "HbA1c", "Kidney Function Test"],
    priceHint: "From ₹699",
    description: "Monitor glucose control and related complications.",
  },
  {
    id: "thyroid",
    name: "Thyroid Profile",
    tests: ["TSH", "T3", "T4"],
    priceHint: "From ₹499",
    description: "Evaluate thyroid hormone levels.",
  },
  {
    id: "vitamin",
    name: "Vitamin Deficiency Panel",
    tests: ["Vitamin D", "Vitamin B12", "Calcium", "Iron Studies"],
    priceHint: "From ₹899",
    description: "Common deficiency markers for fatigue and weakness.",
  },
  {
    id: "full-body",
    name: "Full Body Checkup",
    tests: [
      "Complete Blood Count",
      "Lipid Profile",
      "Liver Function Test",
      "Kidney Function Test",
      "Thyroid Profile",
      "Urine Routine",
    ],
    priceHint: "From ₹1,499",
    description: "Comprehensive annual health screening.",
  },
];

export function getLabTestPanel(panelId: string): LabTestPanel | undefined {
  return LAB_TEST_PANELS.find((panel) => panel.id === panelId);
}
