import { Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export function PayoutProcessedEmail({
  amountINR,
  reference,
}: {
  amountINR: number;
  reference: string;
}) {
  return (
    <EmailLayout preview="Your payout has been processed." title="Payout Processed">
      <Text>
        INR {amountINR.toLocaleString("en-IN")} has been transferred to your
        registered account.
      </Text>
      <Text>Reference ID: {reference}</Text>
    </EmailLayout>
  );
}
