import { Link, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export function NewDoctorJoinAdminEmail({
  entityName,
  email,
  phone,
  specialty,
  plan,
  isFreeListing,
  reviewUrl,
}: {
  entityName: string;
  email: string;
  phone: string;
  specialty: string;
  plan: string;
  isFreeListing: boolean;
  reviewUrl: string;
}) {
  return (
    <EmailLayout preview={`New doctor joined: ${entityName}`} title="New doctor signup">
      <Text>A new doctor has joined techDrHealth.</Text>
      <Text>
        <strong>Name:</strong> {entityName}
        <br />
        <strong>Email:</strong> {email}
        <br />
        <strong>Phone:</strong> {phone}
        <br />
        <strong>Specialty:</strong> {specialty}
        <br />
        <strong>Plan:</strong> {plan}
        <br />
        <strong>Listing:</strong> {isFreeListing ? "Free entry (500 offer)" : "Paid — pending payment"}
      </Text>
      <Text>
        <Link href={reviewUrl}>Review application in admin</Link>
      </Text>
    </EmailLayout>
  );
}
