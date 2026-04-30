import { Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

type BookingAcknowledgementEmailProps = {
  audience: "doctor" | "patient";
  doctorName: string;
  patientName: string;
  appointmentDate: string;
  timeSlot: string;
  patientEmail: string;
  patientWhatsApp: string;
  concern: string;
  labReportUrls?: string[];
  calendarUrl?: string;
  manageBookingUrl?: string;
};

export function BookingAcknowledgementEmail({
  audience,
  doctorName,
  patientName,
  appointmentDate,
  timeSlot,
  patientEmail,
  patientWhatsApp,
  concern,
  labReportUrls = [],
  calendarUrl,
  manageBookingUrl,
}: BookingAcknowledgementEmailProps) {
  const isDoctor = audience === "doctor";

  return (
    <EmailLayout
      preview="Booking acknowledgement received."
      title={isDoctor ? "New booking request received" : "Your booking request is received"}
    >
      <Text>
        {isDoctor
          ? `A new booking request was submitted for Dr. ${doctorName}.`
          : `Hi ${patientName}, your booking request with Dr. ${doctorName} has been received.`}
      </Text>
      <Text>
        <strong>Appointment date:</strong> {appointmentDate}
      </Text>
      <Text>
        <strong>Preferred slot:</strong> {timeSlot}
      </Text>
      <Text>
        <strong>Consultation type:</strong> Video consultation
      </Text>
      {isDoctor ? (
        <>
          <Text>
            <strong>Patient name:</strong> {patientName}
          </Text>
          <Text>
            <strong>Patient email:</strong> {patientEmail}
          </Text>
          <Text>
            <strong>Patient WhatsApp:</strong> {patientWhatsApp}
          </Text>
          <Text>
            <strong>Concern:</strong> {concern}
          </Text>
          {labReportUrls.length > 0 ? (
            <Text>
              <strong>Lab reports:</strong>{" "}
              {labReportUrls.map((url, index) => (
                <span key={url}>
                  <a href={url} target="_blank" rel="noreferrer">
                    Report {index + 1}
                  </a>
                  {index === labReportUrls.length - 1 ? "" : " | "}
                </span>
              ))}
            </Text>
          ) : null}
        </>
      ) : (
        <Text>
          Our care team and doctor will review your request and contact you soon on email/WhatsApp.
        </Text>
      )}
      {calendarUrl ? (
        <Text>
          <a href={calendarUrl} target="_blank" rel="noreferrer">
            Add this appointment to Google Calendar
          </a>
        </Text>
      ) : null}
      {isDoctor && manageBookingUrl ? (
        <>
          <Text>
            To confirm, cancel, or reschedule this appointment, open your booking dashboard:
          </Text>
          <Text>
            <a href={manageBookingUrl} target="_blank" rel="noreferrer">
              Open Doctor Booking Actions
            </a>
          </Text>
        </>
      ) : null}
    </EmailLayout>
  );
}
