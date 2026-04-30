import { Button, Hr, Section, Text } from "@react-email/components";
import { EmailLayout } from "@/emails/_layout";

type Medicine = {
  name: string;
  dosage: string;
  duration: string;
  instructions?: string;
  mealTiming?: "BEFORE_FOOD" | "AFTER_FOOD" | "WITH_FOOD" | "";
  intakeTimes?: Array<"MORNING" | "AFTERNOON" | "EVENING" | "NIGHT">;
  exactTimings?: string;
};

export function PrescriptionIssuedEmail({
  patientName,
  doctorName,
  specialty,
  consultationDate,
  diagnosis,
  medicines,
  instructions,
  followUpDate,
  viewPrescriptionUrl,
  downloadPrescriptionUrl,
}: {
  patientName: string;
  doctorName: string;
  specialty: string;
  consultationDate: string;
  diagnosis: string;
  medicines: Medicine[];
  instructions?: string | null;
  followUpDate?: string | null;
  viewPrescriptionUrl: string;
  downloadPrescriptionUrl?: string;
}) {
  return (
    <EmailLayout
      preview="Your digital prescription is ready."
      title="Your Prescription Is Ready"
    >
      <Text style={{ color: "#334155", fontSize: "14px" }}>
        Hi {patientName}, your doctor has shared your prescription from the recent consultation.
      </Text>

      <Section style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px" }}>
        <Text style={{ margin: "0 0 6px", color: "#0f172a", fontSize: "13px" }}>
          <strong>Doctor:</strong> {doctorName} ({specialty})
        </Text>
        <Text style={{ margin: "0 0 6px", color: "#0f172a", fontSize: "13px" }}>
          <strong>Consultation date:</strong> {consultationDate}
        </Text>
        <Text style={{ margin: "0", color: "#0f172a", fontSize: "13px" }}>
          <strong>Diagnosis:</strong> {diagnosis}
        </Text>
      </Section>

      <Text style={{ color: "#0f172a", fontSize: "14px", marginTop: "16px", marginBottom: "8px" }}>
        <strong>Medicines</strong>
      </Text>
      {medicines.map((medicine, index) => (
        <Section
          key={`${medicine.name}-${index}`}
          style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px", marginBottom: "8px" }}
        >
          <Text style={{ margin: "0 0 4px", color: "#0f172a", fontSize: "13px" }}>
            <strong>
              {index + 1}. {medicine.name}
            </strong>
          </Text>
          <Text style={{ margin: "0", color: "#334155", fontSize: "13px" }}>
            Dosage: {medicine.dosage} | Duration: {medicine.duration}
          </Text>
          {medicine.mealTiming ? (
            <Text style={{ margin: "4px 0 0", color: "#475569", fontSize: "12px" }}>
              Meal timing:{" "}
              {medicine.mealTiming === "BEFORE_FOOD"
                ? "Before food"
                : medicine.mealTiming === "AFTER_FOOD"
                  ? "After food"
                  : "With food"}
            </Text>
          ) : null}
          {medicine.intakeTimes?.length ? (
            <Text style={{ margin: "4px 0 0", color: "#475569", fontSize: "12px" }}>
              Suggested time: {medicine.intakeTimes.join(", ").toLowerCase()}
            </Text>
          ) : null}
          {medicine.exactTimings ? (
            <Text style={{ margin: "4px 0 0", color: "#475569", fontSize: "12px" }}>
              Exact timing: {medicine.exactTimings}
            </Text>
          ) : null}
          {medicine.instructions ? (
            <Text style={{ margin: "4px 0 0", color: "#475569", fontSize: "12px" }}>
              {medicine.instructions}
            </Text>
          ) : null}
        </Section>
      ))}

      {instructions ? (
        <Text style={{ color: "#334155", fontSize: "13px", margin: "10px 0 0" }}>
          <strong>General instructions:</strong> {instructions}
        </Text>
      ) : null}
      {followUpDate ? (
        <Text style={{ color: "#334155", fontSize: "13px", margin: "6px 0 0" }}>
          <strong>Follow-up date:</strong> {followUpDate}
        </Text>
      ) : null}

      <Section style={{ textAlign: "center", marginTop: "18px" }}>
        <Button
          href={viewPrescriptionUrl}
          style={{
            backgroundColor: "#2563eb",
            color: "#ffffff",
            padding: "10px 16px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          View Full Prescription
        </Button>
      </Section>
      {downloadPrescriptionUrl ? (
        <Section style={{ textAlign: "center", marginTop: "10px" }}>
          <Button
            href={downloadPrescriptionUrl}
            style={{
              backgroundColor: "#0f172a",
              color: "#ffffff",
              padding: "10px 16px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            Download Prescription PDF
          </Button>
        </Section>
      ) : null}

      <Hr style={{ borderColor: "#e2e8f0", margin: "20px 0" }} />
      <Text style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
        You can show this prescription page to another doctor whenever needed.
      </Text>
    </EmailLayout>
  );
}
