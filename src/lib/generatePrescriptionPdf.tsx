import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 11 },
  header: { marginBottom: 24, borderBottom: "2px solid #2348c4", paddingBottom: 12 },
  brand: { fontSize: 20, fontWeight: "bold", color: "#0a0f2e" },
  title: { fontSize: 13, fontWeight: "bold", marginBottom: 8, color: "#1e293b" },
  label: { fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
  value: { fontSize: 11, color: "#0f172a", marginBottom: 12 },
  medBox: { border: "1px solid #e2e8f0", borderRadius: 6, padding: 10, marginBottom: 8 },
  medName: { fontSize: 12, fontWeight: "bold", color: "#0f172a", marginBottom: 4 },
  row: { flexDirection: "row", gap: 12 },
  footer: {
    marginTop: 32,
    paddingTop: 12,
    borderTop: "1px solid #e2e8f0",
    fontSize: 9,
    color: "#94a3b8",
    textAlign: "center",
  },
});

type PrescriptionData = {
  diagnosis: string;
  medicines: Array<{ name: string; dosage: string; duration: string; instructions?: string }>;
  instructions?: string;
  followUpDate?: string;
};

export function PrescriptionDocument({
  prescription,
  doctorName,
  patientName,
  specialty,
  date,
}: {
  prescription: PrescriptionData;
  doctorName: string;
  patientName: string;
  specialty: string;
  date: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>TechDrHealth</Text>
          <Text style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>techdrhealth.com · Digital Prescription</Text>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Doctor</Text>
            <Text style={styles.value}>
              {doctorName} · {specialty}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Patient</Text>
            <Text style={styles.value}>{patientName}</Text>
          </View>
          <View>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{date}</Text>
          </View>
        </View>

        <Text style={styles.label}>Diagnosis</Text>
        <Text style={styles.value}>{prescription.diagnosis}</Text>

        <Text style={styles.title}>Medicines</Text>
        {prescription.medicines.map((medicine, index) => (
          <View key={medicine.name + index} style={styles.medBox}>
            <Text style={styles.medName}>
              {index + 1}. {medicine.name}
            </Text>
            <Text style={{ fontSize: 10, color: "#475569" }}>
              Dosage: {medicine.dosage} · Duration: {medicine.duration}
            </Text>
            {medicine.instructions ? (
              <Text style={{ fontSize: 9, color: "#64748b", marginTop: 3 }}>{medicine.instructions}</Text>
            ) : null}
          </View>
        ))}

        {prescription.instructions ? (
          <>
            <Text style={styles.label}>Instructions</Text>
            <Text style={styles.value}>{prescription.instructions}</Text>
          </>
        ) : null}

        {prescription.followUpDate ? (
          <>
            <Text style={styles.label}>Follow-up Date</Text>
            <Text style={styles.value}>{prescription.followUpDate}</Text>
          </>
        ) : null}

        <View style={styles.footer}>
          <Text>This is a digitally generated prescription from TechDrHealth · techdrhealth.com</Text>
          <Text>Valid for pharmacy use across India · For queries contact support@techdrhealth.com</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generatePrescriptionPdf(data: {
  prescription: PrescriptionData;
  doctorName: string;
  patientName: string;
  specialty: string;
  date: string;
}): Promise<Blob> {
  const doc = <PrescriptionDocument {...data} />;
  return pdf(doc).toBlob();
}
