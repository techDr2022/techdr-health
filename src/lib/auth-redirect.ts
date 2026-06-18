export function getDashboardPathForRole(role?: string | null) {
  if (role === "ADMIN") return "/admin";
  if (role === "DOCTOR") return "/dashboard";
  return "/dashboard/patient";
}

export function sanitizeCallbackUrl(value: string | null | undefined, role?: string | null) {
  const fallback = getDashboardPathForRole(role);
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;

  if (role === "ADMIN") {
    if (value.startsWith("/dashboard") || value === "/login") return "/admin";
    if (value.startsWith("/admin")) return value;
    return "/admin";
  }

  if (role === "DOCTOR") {
    if (value.startsWith("/dashboard/patient")) return "/dashboard";
    if (value.startsWith("/admin")) return "/dashboard";
    return value.startsWith("/dashboard") ? value : "/dashboard";
  }

  if (role === "PATIENT") {
    if (value.startsWith("/dashboard") && !value.startsWith("/dashboard/patient")) return "/dashboard/patient";
    if (value.startsWith("/admin")) return "/dashboard/patient";
    return value;
  }

  return value;
}
