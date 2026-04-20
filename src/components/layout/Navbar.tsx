"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Consultations", href: "/consult" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-emerald-100 bg-white/95 shadow-sm backdrop-blur-xl"
          : "border-b border-emerald-100/70 bg-white/90 backdrop-blur-md"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              "bg-emerald-600"
            )}
          >
            <svg className="h-4 w-4 fill-none stroke-2 stroke-white" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span
            className={cn(
              "font-display text-[17px] font-[800] tracking-tight transition-colors",
              "text-emerald-950"
            )}
          >
            techDr <span className="text-emerald-600">Tele Health</span>
          </span>
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
          <Button
            asChild
            size="sm"
            className="rounded-full bg-emerald-600 px-5 text-[13px] font-semibold text-white shadow-md shadow-emerald-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500"
          >
            <Link href="/join">Join as Doctor / Clinic / Hospital</Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            size="sm"
            className="text-[13px] font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Link href="/login">Sign In</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-full bg-slate-900 px-5 text-[13px] font-semibold text-white shadow-md shadow-slate-900/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <Link href="/consult">Schedule Consultation</Link>
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
                <Button
                  className="w-full rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
                  asChild
                >
                  <Link href="/join">Join as Doctor / Clinic / Hospital</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800" asChild>
                  <Link href="/consult">Schedule Consultation</Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
