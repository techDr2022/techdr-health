"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SUBSCRIPTION_PLANS, type PlanType } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TOP_BORDER_CLASS: Record<PlanType, string> = {
  INDIVIDUAL: "border-t-teal-500",
  CLINIC: "border-t-blue-500",
  HOSPITAL: "border-t-slate-800",
};

export function PricingCards() {
  const router = useRouter();
  const plans = Object.entries(SUBSCRIPTION_PLANS) as [
    PlanType,
    (typeof SUBSCRIPTION_PLANS)[PlanType],
  ][];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map(([planType, plan], index) => (
        <Card
          key={plan.id}
          className={cn(
            "border-t-4 bg-white/70 backdrop-blur transition-all hover:-translate-y-1 hover:bg-white/90 hover:shadow-2xl",
            TOP_BORDER_CLASS[planType],
            planType === "CLINIC" && "ring-2 ring-blue-300"
          )}
        >
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant={planType === "CLINIC" ? "default" : "outline"}>
                {plan.badge}
              </Badge>
              <span className="text-xs text-muted-foreground">Annual billing</span>
            </div>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              className="font-heading text-4xl font-semibold text-slate-900"
            >
              INR {plan.price.toLocaleString("en-IN")}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                /year
              </span>
            </motion.p>
            <p className="text-sm text-muted-foreground">
              Just INR {Math.round(plan.price / 12).toLocaleString("en-IN")}/month
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => router.push(`/join/register?plan=${plan.id}`)}
              >
                Get Started - First 500 Free
              </Button>
              <p className="text-xs text-muted-foreground">
                First 500 listings: free annual subscription
              </p>
              <p className="text-xs text-muted-foreground">48-hour verification</p>
              <p className="text-xs text-muted-foreground">Cancel anytime</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
