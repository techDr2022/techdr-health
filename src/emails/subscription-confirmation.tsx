import { Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export function SubscriptionConfirmationEmail({ entityName }: { entityName: string }) {
  return (
    <EmailLayout
      preview="Subscription payment received successfully."
      title="Subscription Confirmation"
    >
      <Text>Hi {entityName},</Text>
      <Text>
        We have received your annual subscription payment and your account is
        approved successfully.
      </Text>
      <Text>You can now complete your profile and start accepting consultations.</Text>
    </EmailLayout>
  );
}
