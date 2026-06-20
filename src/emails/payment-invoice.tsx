import { Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export function PaymentInvoiceEmail({
  patientName,
  invoiceNumber,
  totalInr,
  downloadUrl,
}: {
  patientName: string;
  invoiceNumber: string;
  totalInr: number;
  downloadUrl: string;
}) {
  return (
    <EmailLayout preview="Your consultation tax invoice is ready." title="Payment Invoice">
      <Text>Hi {patientName},</Text>
      <Text>
        Thank you for your payment. Your tax invoice <strong>{invoiceNumber}</strong> for INR{" "}
        {totalInr.toLocaleString("en-IN")} is ready.
      </Text>
      <Text>
        Download invoice:{" "}
        <a href={downloadUrl} style={{ color: "#0ea5e9" }}>
          {downloadUrl}
        </a>
      </Text>
    </EmailLayout>
  );
}
