import { Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export function SubscriptionExpiredEmail({ plan }: { plan: string }) {
  return (
    <EmailLayout preview="Your subscription is now expired." title="Subscription Expired">
      <Text>Your {plan} subscription has expired and your profile is currently hidden.</Text>
      <Text>
        Renew your subscription to reactivate visibility and continue receiving
        teleconsultation bookings.
      </Text>
    </EmailLayout>
  );
}
