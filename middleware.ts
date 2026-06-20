import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDashboardPathForRole } from "@/lib/auth-redirect";
import { checkApiRateLimit } from "@/lib/rate-limit";

export default auth(async (req) => {
  const { nextUrl } = req;

  if (nextUrl.pathname.startsWith("/api")) {
    const rateLimitResponse = await checkApiRateLimit(req, req.auth?.user?.id);
    if (rateLimitResponse) return rateLimitResponse;
    return NextResponse.next();
  }

  const session = req.auth;
  const isLoggedIn = !!session;
  const role = session?.user?.role;

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isPatientRoute = nextUrl.pathname.startsWith("/dashboard/patient");
  const isDoctorRoute = isDashboardRoute && !isPatientRoute;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL(getDashboardPathForRole(role), nextUrl));
  }

  if (!isLoggedIn && (isDashboardRoute || isAdminRoute)) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", `${nextUrl.pathname}${nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isDoctorRoute && role !== "DOCTOR") {
    return NextResponse.redirect(new URL(getDashboardPathForRole(role), nextUrl));
  }

  if (isLoggedIn && isPatientRoute && role !== "PATIENT") {
    return NextResponse.redirect(new URL(getDashboardPathForRole(role), nextUrl));
  }

  if (isLoggedIn && isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL(getDashboardPathForRole(role), nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
