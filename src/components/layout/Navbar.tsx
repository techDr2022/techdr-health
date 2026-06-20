"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FreeSlotsLeft } from "@/components/join/FreeSlotsLeft";
import { JoinDoctorModal } from "@/components/join/JoinDoctorModal";
import { cn } from "@/lib/utils";
import { getDashboardPathForRole } from "@/lib/auth-redirect";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Global", href: "/teleconsultation" },
  { label: "Book", href: "/book" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const role = session?.user?.role;
  const dashboardHref = getDashboardPathForRole(role);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-emerald-100 bg-white/95 shadow-sm backdrop-blur-xl"
          : "border-b border-emerald-100/70 bg-white/90 backdrop-blur-md"
      )}
    >
      <button
        type="button"
        onClick={() => setJoinModalOpen(true)}
        className="flex h-8 w-full items-center justify-center gap-1.5 border-b border-emerald-200 bg-emerald-600 px-3 text-center text-[11px] font-bold text-white transition-colors hover:bg-emerald-500 sm:text-xs"
      >
        <span>500 free entries</span>
        <span aria-hidden="true">·</span>
        <FreeSlotsLeft compact fallback="join now" />
      </button>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/techdrhealth-logo.png"
            alt="techDrHealth"
            width={170}
            height={44}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "rounded-lg px-3.5 py-2 font-body text-[13px] font-medium transition-all duration-200",
                "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          {!isLoggedIn ? (
            <Button
              size="sm"
              className="rounded-full bg-emerald-600 px-4 text-[13px] font-semibold text-white shadow-md shadow-emerald-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500"
              onClick={() => setJoinModalOpen(true)}
            >
              Join Free as a Doctor
            </Button>
          ) : null}
          {isLoggedIn ? (
            <>
              <Button
                variant="ghost"
                asChild
                size="sm"
                className="text-[13px] font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Link href={dashboardHref}>Dashboard</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-[13px] font-semibold"
                onClick={() => void signOut({ callbackUrl: "/" })}
              >
                Logout
              </Button>
            </>
          ) : status !== "loading" ? (
            <Button
              variant="ghost"
              asChild
              size="sm"
              className="text-[13px] font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          ) : null}
          <Button
            asChild
            size="sm"
            className="rounded-full bg-slate-900 px-5 text-[13px] font-semibold text-white shadow-md shadow-slate-900/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <Link href="/book">Book Now</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md md:hidden",
              "text-slate-800 hover:bg-slate-100"
            )}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-l border-emerald-100 bg-white">
            <nav className="mt-8 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setJoinModalOpen(true)}
                className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center text-sm font-semibold text-emerald-800"
              >
                500 free entries · <FreeSlotsLeft compact fallback="join now" />
              </button>
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-xl px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
                {isLoggedIn ? (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={dashboardHref}>Dashboard</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => void signOut({ callbackUrl: "/" })}
                    >
                      Logout
                    </Button>
                  </>
                ) : status !== "loading" ? (
                  <>
                    <Button
                      className="w-full rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
                      onClick={() => setJoinModalOpen(true)}
                    >
                      Join Free as a Doctor
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </>
                ) : null}
                <Button className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800" asChild>
                  <Link href="/book">Book Now</Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
    {!isLoggedIn ? (
      <JoinDoctorModal open={joinModalOpen} onOpenChange={setJoinModalOpen} />
    ) : null}
    </>
  );
}
