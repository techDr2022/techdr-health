import { Link, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export function ApplicationApprovedEmail({ entityName }: { entityName: string }) {
  return (
    <EmailLayout preview="Your application is approved." title="Welcome to techDr Tele Health">
      <Text>Hi {entityName},</Text>
      <Text>
        Congratulations. Your application has been approved and your profile is now
        active on the platform.
      </Text>
      <Text>
        Use your registered email to log in and complete your public profile before
        accepting consultations.
      </Text>
      <Text>
        <Link href="https://www.vitalconsult.health/dashboard">Open Dashboard</Link>
      </Text>
    </EmailLayout>
  );
}
