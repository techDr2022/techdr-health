import { Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export function ApplicationRejectedEmail({
  entityName,
  reason,
}: {
  entityName: string;
  reason: string;
}) {
  return (
    <EmailLayout preview="Application update from techDr Tele Health." title="Application Update">
      <Text>Hi {entityName},</Text>
      <Text>
        We are unable to approve your application at this time. Reason: {reason}
      </Text>
      <Text>
        You can reapply after updating your documents and profile details. If you
        need help, reply to this email and our support team will assist you.
      </Text>
    </EmailLayout>
  );
}
