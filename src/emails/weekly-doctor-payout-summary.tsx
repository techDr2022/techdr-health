import { Section, Text } from "@react-email/components";
import type { CSSProperties } from "react";
import { EmailLayout } from "./_layout";

type DoctorPayoutRow = {
  doctorName: string;
  doctorEmail: string;
  consultations: number;
  amountINR: number;
};

export function WeeklyDoctorPayoutSummaryEmail({
  weekLabel,
  rows,
  totalAmountINR,
  totalConsultations,
}: {
  weekLabel: string;
  rows: DoctorPayoutRow[];
  totalAmountINR: number;
  totalConsultations: number;
}) {
  return (
    <EmailLayout
      preview={`Weekly doctor payout summary for ${weekLabel}`}
      title="Weekly Doctor Payout Summary"
    >
      <Text style={{ color: "#334155" }}>
        Weekly summary window: <strong>{weekLabel}</strong>
      </Text>
      <Text style={{ color: "#334155" }}>
        Total consultations: <strong>{totalConsultations}</strong>
        <br />
        Total payout amount: <strong>INR {totalAmountINR.toLocaleString("en-IN")}</strong>
      </Text>

      <Section style={{ marginTop: "16px" }}>
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ borderCollapse: "collapse", fontSize: "13px", color: "#0f172a" }}
        >
          <thead>
            <tr>
              <th style={headerCellStyle}>Doctor</th>
              <th style={headerCellStyle}>Email</th>
              <th style={{ ...headerCellStyle, textAlign: "right" }}>Consultations</th>
              <th style={{ ...headerCellStyle, textAlign: "right" }}>Payout (INR)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.doctorEmail}-${row.doctorName}`}>
                <td style={bodyCellStyle}>{row.doctorName}</td>
                <td style={bodyCellStyle}>{row.doctorEmail}</td>
                <td style={{ ...bodyCellStyle, textAlign: "right" }}>{row.consultations}</td>
                <td style={{ ...bodyCellStyle, textAlign: "right" }}>
                  {row.amountINR.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </EmailLayout>
  );
}

const headerCellStyle: CSSProperties = {
  borderBottom: "1px solid #cbd5e1",
  fontWeight: 700,
  padding: "8px",
  textAlign: "left",
};

const bodyCellStyle: CSSProperties = {
  borderBottom: "1px solid #e2e8f0",
  padding: "8px",
  verticalAlign: "top",
};
