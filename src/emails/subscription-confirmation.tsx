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
        We have received your annual subscription payment. Your documents are now
        queued for verification and our team will complete review within 24-48
        business hours.
      </Text>
      <Text>You will receive an approval email as soon as verification is complete.</Text>
    </EmailLayout>
  );
}
