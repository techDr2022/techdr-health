import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardPathForRole } from "@/lib/auth-redirect";

export async function ensureAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect(getDashboardPathForRole(session.user.role));
  }
  return session;
}
