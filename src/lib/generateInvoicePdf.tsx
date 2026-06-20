import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { InvoiceData } from "@/lib/invoice";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 11 },
  header: { marginBottom: 20, borderBottom: "2px solid #0ea5e9", paddingBottom: 12 },
  brand: { fontSize: 20, fontWeight: "bold", color: "#0a1628" },
  subtitle: { fontSize: 10, color: "#64748b", marginTop: 2 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 8, color: "#0f172a" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { color: "#64748b", fontSize: 10 },
  value: { color: "#0f172a", fontSize: 10, fontWeight: "bold" },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid #cbd5e1",
    paddingBottom: 6,
    marginBottom: 6,
    marginTop: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e2e8f0",
    paddingVertical: 8,
  },
  colDesc: { width: "55%" },
  colSac: { width: "15%" },
  colAmt: { width: "30%", textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTop: "1px solid #cbd5e1",
  },
  footer: {
    marginTop: 28,
    fontSize: 9,
    color: "#94a3b8",
    textAlign: "center",
  },
});

function formatInr(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`;
}

export function InvoiceDocument({ invoice }: { invoice: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>{invoice.companyName}</Text>
          <Text style={styles.subtitle}>Tax Invoice · {invoice.siteUrl.replace(/^https?:\/\//, "")}</Text>
          <Text style={styles.subtitle}>GSTIN: {invoice.companyGstin}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 24, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text>{invoice.patientName}</Text>
            <Text style={{ color: "#64748b", fontSize: 10 }}>{invoice.patientEmail}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Invoice No.</Text>
              <Text style={styles.value}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{invoice.invoiceDate}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Payment Ref</Text>
              <Text style={styles.value}>{invoice.paymentReference}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Consultation</Text>
        <Text style={{ fontSize: 10, color: "#475569", marginBottom: 8 }}>
          {invoice.doctorName} · {invoice.specialty} · {invoice.consultType} · {invoice.scheduledAt}
        </Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.colDesc, { fontWeight: "bold" }]}>Description</Text>
          <Text style={[styles.colSac, { fontWeight: "bold" }]}>SAC</Text>
          <Text style={[styles.colAmt, { fontWeight: "bold" }]}>Amount</Text>
        </View>

        {invoice.lineItems.map((item) => (
          <View key={item.description} style={styles.tableRow}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colSac}>{item.sac}</Text>
            <Text style={styles.colAmt}>{formatInr(item.amountInr)}</Text>
          </View>
        ))}

        <View style={{ marginTop: 12 }}>
          <View style={styles.row}>
            <Text style={styles.label}>CGST @ 9%</Text>
            <Text style={styles.value}>{formatInr(invoice.cgstInr)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>SGST @ 9%</Text>
            <Text style={styles.value}>{formatInr(invoice.sgstInr)}</Text>
          </View>
          {invoice.healthPassDiscountInr > 0 ? (
            <View style={styles.row}>
              <Text style={styles.label}>Health Pass discount</Text>
              <Text style={styles.value}>- {formatInr(invoice.healthPassDiscountInr)}</Text>
            </View>
          ) : null}
          <View style={styles.totalRow}>
            <Text style={{ fontWeight: "bold" }}>Total Paid</Text>
            <Text style={{ fontWeight: "bold", fontSize: 12 }}>{formatInr(invoice.totalInr)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          GST is applicable on the platform facilitation fee only. This is a computer-generated invoice.
        </Text>
      </Page>
    </Document>
  );
}

export async function generateInvoicePdf(invoice: InvoiceData): Promise<Blob> {
  return pdf(<InvoiceDocument invoice={invoice} />).toBlob();
}
