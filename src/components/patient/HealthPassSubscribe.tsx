"use client";

import Script from "next/script";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HEALTH_PASS_PLANS, type HealthPassPlanId } from "@/lib/patient-health-pass";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => {
      checkout: (options: { paymentSessionId: string; redirectTarget?: "_self" | "_blank" | "_modal" }) => Promise<{
        error?: { message?: string };
      }>;
    };
  }
}

type HealthPassSubscribeButtonProps = {
  plan: HealthPassPlanId;
  highlighted?: boolean;
  className?: string;
};

export function HealthPassSubscribeButton({
  plan,
  highlighted,
  className,
}: HealthPassSubscribeButtonProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const planConfig = HEALTH_PASS_PLANS[plan];

  const subscribe = useCallback(async () => {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent("/pricing")}`);
      return;
    }
    if (session?.user?.role !== "PATIENT") {
      toast.error("Health Pass is available for patient accounts.");
      return;
    }

    setLoading(true);
    try {
      const orderResponse = await fetch("/api/patient/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const orderData = (await orderResponse.json()) as {
        error?: string;
        paymentSessionId?: string;
        orderId?: string;
        cashfreeMode?: string;
      };

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Unable to start subscription payment.");
      }

      if (!orderData.paymentSessionId || !window.Cashfree) {
        throw new Error("Payment session unavailable. Please refresh and try again.");
      }

      const cashfree = window.Cashfree({
        mode: orderData.cashfreeMode === "PROD" ? "production" : "sandbox",
      });
      const checkoutResult = await cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: "_modal",
      });
      if (checkoutResult.error) {
        throw new Error(checkoutResult.error.message || "Payment was not completed.");
      }

      const verifyResponse = await fetch("/api/patient/subscribe/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.orderId }),
      });
      if (!verifyResponse.ok) {
        toast.error("Payment completed but activation is pending. Please refresh in a minute.");
        return;
      }

      toast.success(`${planConfig.name} activated!`);
      router.push("/dashboard/patient");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Subscription failed.");
    } finally {
      setLoading(false);
    }
  }, [plan, planConfig.name, router, session?.user?.role, status]);

  return (
    <>
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />
      <Button
        type="button"
        onClick={() => void subscribe()}
        disabled={loading}
        className={cn(
          "w-full rounded-xl",
          highlighted ? "bg-emerald-600 hover:bg-emerald-500" : "",
          className
        )}
        variant={highlighted ? "default" : "outline"}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Subscribe — ₹{planConfig.priceINR}/mo
      </Button>
    </>
  );
}

export function HealthPassFeatureList({ plan }: { plan: HealthPassPlanId }) {
  const features = HEALTH_PASS_PLANS[plan].features;
  return (
    <ul className="mt-5 space-y-2.5">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
          {feature}
        </li>
      ))}
    </ul>
  );
}
