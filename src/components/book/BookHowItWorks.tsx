"use client";

import Link from "next/link";
import { CalendarCheck, Search, Video } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Search,
    title: "Search & compare",
    copy: "Filter by specialty, language, rating, or fee",
  },
  {
    icon: CalendarCheck,
    title: "Pick your slot",
    copy: "Choose date & time — takes under 2 minutes",
  },
  {
    icon: Video,
    title: "Join video call",
    copy: "Secure HD consultation from any device",
  },
];

export function BookHowItWorks() {
  return (
    <section className="border-y border-emerald-100/80 bg-white/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Simple process
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-[#0A1628] sm:text-3xl">
            Three steps to your consultation
          </h2>
        </div>

        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              className="relative rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-5 shadow-sm"
            >
              <span className="absolute -top-2.5 left-5 flex h-6 w-6 items-center justify-center rounded-full bg-[#0EA5E9] text-[11px] font-bold text-white shadow-md">
                {index + 1}
              </span>
              <step.icon
                className="mt-2 h-8 w-8 text-[#0EA5E9]"
                aria-hidden
              />
              <h3 className="mt-3 font-heading text-base font-semibold text-[#0A1628]">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {step.copy}
              </p>
            </motion.li>
          ))}
        </ol>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Not sure where to start?{" "}
          <Link
            href="/book?specialty=general-medicine"
            className="font-semibold text-[#0EA5E9] hover:underline"
          >
            Try General Medicine
          </Link>{" "}
          for fever, cough, or general health concerns.
        </p>
      </div>
    </section>
  );
}
