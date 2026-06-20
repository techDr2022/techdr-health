import { Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export function ReferralMilestoneEmail({
  entityName,
  milestone,
  rewardLabel,
}: {
  entityName: string;
  milestone: number;
  rewardLabel: string;
}) {
  return (
    <EmailLayout
      preview={`You unlocked a referral milestone: ${rewardLabel}`}
      title="Referral Milestone Achieved"
    >
      <Text>Hi {entityName},</Text>
      <Text>
        Congratulations! You have reached <strong>{milestone} successful doctor referrals</strong> on
        TechDrHealth.
      </Text>
      <Text>Your milestone reward: {rewardLabel}</Text>
      <Text>
        Cash rewards are processed by our team within 5–7 business days. Subscription bonuses are
        applied automatically to your account.
      </Text>
      <Text>Keep sharing your referral link to unlock the next milestone.</Text>
    </EmailLayout>
  );
}
