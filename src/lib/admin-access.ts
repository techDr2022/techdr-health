import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function ensureAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect(session.user.role === "DOCTOR" ? "/dashboard" : "/dashboard/patient");
  }
  return session;
}
