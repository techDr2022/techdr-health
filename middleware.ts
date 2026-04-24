import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session;

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isPatientRoute = nextUrl.pathname.startsWith("/dashboard/patient");
  const isDoctorRoute = isDashboardRoute && !isPatientRoute;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

  if (isLoggedIn && isAuthRoute) {
    const role = session.user?.role;
    const redirectPath =
      role === "DOCTOR" ? "/dashboard" : role === "ADMIN" ? "/admin" : "/dashboard/patient";
    return NextResponse.redirect(new URL(redirectPath, nextUrl));
  }

  if (!isLoggedIn && (isDashboardRoute || isAdminRoute)) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", `${nextUrl.pathname}${nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isDoctorRoute && session.user?.role !== "DOCTOR") {
    return NextResponse.redirect(new URL("/dashboard/patient", nextUrl));
  }

  if (isLoggedIn && isPatientRoute && session.user?.role !== "PATIENT") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
