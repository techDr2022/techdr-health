import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ITEMS = [
  {
    icon: "🔒",
    title: "Secure Payment Processing",
    desc: "End-to-end encrypted payments via Razorpay.",
  },
  {
    icon: "📹",
    title: "Video Infrastructure",
    desc: "HD video consultation servers and bandwidth.",
  },
  {
    icon: "⚖️",
    title: "Legal & Compliance",
    desc: "HIPAA-aligned data protection, legal compliance, and insurance support.",
  },
  {
    icon: "🔍",
    title: "Patient Acquisition",
    desc: "Marketing, SEO, and paid campaigns to drive quality patient traffic.",
  },
  {
    icon: "🛡️",
    title: "Fraud Protection",
    desc: "Fraud monitoring, secure settlement workflows, and chargeback protection.",
  },
  {
    icon: "📊",
    title: "Platform & Support",
    desc: "24/7 support, reliability monitoring, and continuous feature updates.",
  },
] as const;

export function PlatformFeeTransparency() {
  return (
    <section id="platform-fee" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            We charge a 25% platform fee per consultation. This directly funds the
            systems that help you scale online.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span>{item.icon}</span>
                  <span>{item.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mx-auto mt-10 max-w-2xl border-teal-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Example Earnings Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span>Your Consultation Fee</span>
              <span>INR 500</span>
            </div>
            <div className="flex justify-between border-b pb-2 text-muted-foreground">
              <span>Platform Fee (25%)</span>
              <span>- INR 125</span>
            </div>
            <div className="flex justify-between rounded-lg bg-teal-50 p-3 font-medium text-teal-900">
              <span>You Receive</span>
              <span>INR 375 per consultation</span>
            </div>
            <p className="text-xs text-muted-foreground">
              GST at 18% on the platform fee is charged to the patient, not
              deducted from your payout.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
