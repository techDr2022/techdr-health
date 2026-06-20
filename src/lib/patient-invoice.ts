import { PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { generateInvoiceData } from "@/lib/invoice";
import { generateInvoicePdf } from "@/lib/generateInvoicePdf";
import { sendPaymentInvoiceEmail } from "@/lib/email";
import { getR2Client, getR2Config } from "@/lib/r2";
import { getSiteUrl } from "@/lib/site-config";

export async function issuePatientInvoice(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      patient: { select: { name: true, email: true } },
      doctor: { select: { displayName: true, specialty: true } },
    },
  });

  if (!booking || booking.payStatus !== "CAPTURED") {
    return { ok: false as const, error: "Booking is not eligible for invoicing." };
  }

  if (booking.invoicepdfkey) {
    return {
      ok: true as const,
      alreadyIssued: true,
      invoiceNumber: booking.invoicenumber,
      pdfKey: booking.invoicepdfkey,
    };
  }

  const invoice = generateInvoiceData(booking);
  const pdfBlob = await generateInvoicePdf(invoice);
  const pdfBytes = Buffer.from(await pdfBlob.arrayBuffer());
  const pdfKey = `invoices/${booking.id}-${Date.now()}.pdf`;

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2Config().bucketName,
      Key: pdfKey,
      Body: pdfBytes,
      ContentType: "application/pdf",
      CacheControl: "private, max-age=0, no-cache",
    })
  );

  const issuedAt = new Date();
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      invoicenumber: invoice.invoiceNumber,
      invoicepdfkey: pdfKey,
      invoiceissuedat: issuedAt,
    },
  });

  if (booking.patient.email) {
    const downloadUrl = `${getSiteUrl()}/api/patient/invoices/${booking.id}/pdf`;
    await sendPaymentInvoiceEmail(booking.patient.email, {
      patientName: booking.patient.name || "Patient",
      invoiceNumber: invoice.invoiceNumber,
      totalInr: invoice.totalInr,
      downloadUrl,
    }).catch((error) => {
      console.error("payment invoice email failed", error);
    });
  }

  return {
    ok: true as const,
    alreadyIssued: false,
    invoiceNumber: invoice.invoiceNumber,
    pdfKey,
  };
}
