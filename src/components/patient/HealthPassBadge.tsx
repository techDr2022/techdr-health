import Link from "next/link";
import { getActivePatientHealthPass } from "@/lib/patient-health-pass-db";
import { formatHealthPassPlanLabel } from "@/lib/patient-health-pass";

export async function HealthPassBadge({ userId }: { userId: string }) {
  const pass = await getActivePatientHealthPass(userId);
  if (!pass) {
    return (
      <Link
        href="/pricing"
        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
      >
        Get Health Pass →
      </Link>
    );
  }

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
        Health Pass Active · {formatHealthPassPlanLabel(pass.plan)}
      </span>
      <span className="text-xs text-slate-500">
        Renews {pass.enddate.toLocaleDateString("en-IN")}
        {pass.plan === "BASIC"
          ? ` · ${pass.videoconsultsused}/2 video consults used`
          : null}
      </span>
    </div>
  );
}
