export const SUBSCRIPTION_PLANS = {
  INDIVIDUAL: {
    id: "individual_doctor",
    name: "Individual Doctor",
    price: 4999,
    currency: "INR",
    duration: 365,
    maxDoctors: 1,
    features: [
      "1 Doctor Profile Listed",
      "Verified Doctor Badge",
      "Unlimited Patient Consultations",
      "Video + Audio + Chat Consultations",
      "Personal Booking Page",
      "Patient Reviews & Ratings",
      "Analytics Dashboard",
      "Priority Search Listing",
      "24/7 Platform Support",
      "Digital Prescription Tool",
    ],
    razorpayPlanId: process.env.RAZORPAY_PLAN_INDIVIDUAL,
    badge: "Most Popular",
    color: "teal",
  },
  CLINIC: {
    id: "clinic_2doctors",
    name: "Clinic - 2 Doctors",
    price: 10000,
    currency: "INR",
    duration: 365,
    maxDoctors: 2,
    features: [
      "2 Doctor Profiles Listed",
      "Clinic Brand Page",
      "Verified Clinic Badge",
      "Unlimited Patient Consultations",
      "Video + Audio + Chat Consultations",
      "Shared Booking Dashboard",
      "Patient Reviews & Ratings",
      "Analytics Dashboard",
      "Priority Search Listing",
      "24/7 Platform Support",
      "Digital Prescription Tool",
      "Clinic Logo & Branding",
    ],
    razorpayPlanId: process.env.RAZORPAY_PLAN_CLINIC,
    badge: "Best Value",
    color: "blue",
  },
  HOSPITAL: {
    id: "hospital",
    name: "Hospital",
    price: 15000,
    currency: "INR",
    duration: 365,
    maxDoctors: 999,
    features: [
      "Unlimited Doctor Profiles",
      "Hospital Brand Page",
      "Verified Hospital Badge",
      "Unlimited Patient Consultations",
      "Video + Audio + Chat Consultations",
      "Central Admin Dashboard",
      "Patient Reviews & Ratings",
      "Advanced Analytics & Reports",
      "Top Search Listing Priority",
      "Dedicated Account Manager",
      "Digital Prescription Tool",
      "Hospital Logo & Branding",
      "Multi-department Management",
      "Staff Access Controls",
    ],
    razorpayPlanId: process.env.RAZORPAY_PLAN_HOSPITAL,
    badge: "Enterprise",
    color: "navy",
  },
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;
export const FREE_LISTING_LIMIT = 500;

export const PLAN_ID_TO_TYPE: Record<string, PlanType> = {
  [SUBSCRIPTION_PLANS.INDIVIDUAL.id]: "INDIVIDUAL",
  [SUBSCRIPTION_PLANS.CLINIC.id]: "CLINIC",
  [SUBSCRIPTION_PLANS.HOSPITAL.id]: "HOSPITAL",
};

export const PLATFORM_FEE_PERCENT = 25;

export function calculateDoctorPayout(consultationFee: number): {
  platformFee: number;
  doctorPayout: number;
  gstOnPlatformFee: number;
  totalPatientPays: number;
} {
  const platformFee = Math.round(consultationFee * 0.25);
  const gstOnPlatformFee = Math.round(platformFee * 0.18);
  const doctorPayout = consultationFee - platformFee;
  const totalPatientPays = consultationFee + gstOnPlatformFee;

  return { platformFee, doctorPayout, gstOnPlatformFee, totalPatientPays };
}
