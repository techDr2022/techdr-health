"use server";

import { revalidatePath } from "next/cache";
import { ensureAdminAccess } from "@/lib/admin-access";
import { markReferralMilestonePaid } from "@/lib/doctor-referral";

export async function markCashMilestonePaidAction(formData: FormData) {
  await ensureAdminAccess();
  const milestoneId = String(formData.get("id") ?? "").trim();
  if (!milestoneId) return;
  await markReferralMilestonePaid(milestoneId);
  revalidatePath("/admin/referrals");
}
