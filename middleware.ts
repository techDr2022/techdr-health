import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session;

  const isDoctorRoute = nextUrl.pathname.startsWith("/dashboard/doctor");
  const isPatientRoute = nextUrl.pathname.startsWith("/dashboard/patient");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

  if (isLoggedIn && isAuthRoute) {
    const role = session.user?.role;
    const redirectPath =
      role === "DOCTOR" ? "/dashboard/doctor" : role === "ADMIN" ? "/admin" : "/dashboard/patient";
    return NextResponse.redirect(new URL(redirectPath, nextUrl));
  }

  if (!isLoggedIn && (isDoctorRoute || isPatientRoute || isAdminRoute)) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isDoctorRoute && session.user?.role !== "DOCTOR") {
    return NextResponse.redirect(new URL("/dashboard/patient", nextUrl));
  }

  if (isLoggedIn && isPatientRoute && session.user?.role !== "PATIENT") {
    return NextResponse.redirect(new URL("/dashboard/doctor", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
