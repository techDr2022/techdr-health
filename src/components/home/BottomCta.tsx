import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BottomCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-[#0A1628] px-8 py-14 text-center text-[#F8FAFC] shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#0EA5E9]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#10B981]/15 blur-3xl" />
        <h2 className="relative font-heading text-3xl font-semibold sm:text-4xl">
          Ready to see a doctor?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
          Join thousands of patients who start with online doctor consultation
          and stay with techDr Tele Health for longitudinal care.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white shadow-lg"
          >
            <Link href="/consult" data-analytics-event="book_bottom_cta">
              Book consultation
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/40 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/doctors">Browse doctors</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
