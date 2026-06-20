import { getSiteUrl, SITE_NAME } from "@/lib/site-config";

export const SAC_CONSULTATION = "999316";
export const SAC_PLATFORM_FEE = "998313";

export type InvoiceBookingInput = {
  id: string;
  scheduledAt: Date;
  consultType: string;
  consultFee: number;
  platformFeeINR: number;
  gstINR: number;
  totalPatientPays: number;
  healthpassdiscountinr: number;
  cashfreeOrderId: string | null;
  patient: { name: string; email: string };
  doctor: { displayName: string; specialty: string };
};

export type InvoiceData = {
  invoiceNumber: string;
  invoiceDate: string;
  companyName: string;
  companyGstin: string;
  siteUrl: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  specialty: string;
  consultType: string;
  scheduledAt: string;
  paymentReference: string;
  lineItems: Array<{
    description: string;
    sac: string;
    amountInr: number;
  }>;
  cgstInr: number;
  sgstInr: number;
  healthPassDiscountInr: number;
  subtotalInr: number;
  totalInr: number;
};

export function buildInvoiceNumber(bookingId: string, issuedAt: Date) {
  const year = issuedAt.getFullYear();
  return `INV-${year}-${bookingId.slice(0, 8).toUpperCase()}`;
}

export function generateInvoiceData(booking: InvoiceBookingInput): InvoiceData {
  const issuedAt = new Date();
  const invoiceNumber = buildInvoiceNumber(booking.id, issuedAt);
  const cgstInr = Math.round(booking.gstINR / 2);
  const sgstInr = booking.gstINR - cgstInr;
  const subtotalInr =
    booking.consultFee + booking.platformFeeINR + booking.gstINR - booking.healthpassdiscountinr;

  return {
    invoiceNumber,
    invoiceDate: issuedAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    companyName: SITE_NAME,
    companyGstin: process.env.COMPANY_GSTIN?.trim() || "GSTIN pending",
    siteUrl: getSiteUrl(),
    patientName: booking.patient.name || "Patient",
    patientEmail: booking.patient.email,
    doctorName: booking.doctor.displayName,
    specialty: booking.doctor.specialty,
    consultType: booking.consultType,
    scheduledAt: booking.scheduledAt.toLocaleString("en-IN"),
    paymentReference: booking.cashfreeOrderId || booking.id,
    lineItems: [
      {
        description: `Teleconsultation — ${booking.doctor.displayName}`,
        sac: SAC_CONSULTATION,
        amountInr: booking.consultFee,
      },
      {
        description: "Platform facilitation fee",
        sac: SAC_PLATFORM_FEE,
        amountInr: booking.platformFeeINR,
      },
    ],
    cgstInr,
    sgstInr,
    healthPassDiscountInr: booking.healthpassdiscountinr,
    subtotalInr,
    totalInr: booking.totalPatientPays,
  };
}
