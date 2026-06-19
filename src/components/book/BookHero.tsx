"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Clock,
  Shield,
  Sparkles,
  Users,
  Video,
  Zap,
} from "lucide-react";

type Props = {
  availableCount: number;
  specialtyCount: number;
};

const trustItems = [
  { icon: BadgeCheck, label: "Verified MDs" },
  { icon: Video, label: "HD video" },
  { icon: Shield, label: "Encrypted" },
  { icon: Zap, label: "Instant booking" },
];

export function BookHero({ availableCount, specialtyCount }: Props) {
  return (
    <section className="relative overflow-hidden bg-[#0A1628] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#0EA5E9]/20 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.12),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-200 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Smart telehealth booking
            </p>
            <h1 className="mt-5 font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl text-balance">
              Book your doctor in{" "}
              <span className="bg-gradient-to-r from-sky-300 to-emerald-300 bg-clip-text text-transparent">
                under 2 minutes
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-300 leading-relaxed sm:text-lg">
              Search by symptom or specialty, compare verified doctors, pick a
              slot, and join a secure video consultation from anywhere.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {trustItems.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-sm sm:text-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-sky-300" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:gap-4 lg:max-w-sm">
            {[
              {
                icon: Users,
                value: availableCount.toLocaleString("en-IN"),
                label: "Doctors live now",
                accent: "text-emerald-300",
              },
              {
                icon: Clock,
                value: "20 min",
                label: "Avg. consult slot",
                accent: "text-sky-300",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
              >
                <stat.icon className={`h-5 w-5 ${stat.accent}`} aria-hidden />
                <p className="mt-2 font-heading text-2xl font-semibold">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.26, duration: 0.35 }}
              className="col-span-2 rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 to-sky-500/10 p-4 backdrop-blur-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
                {specialtyCount}+ medical specialties
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Cardiology · Dermatology · Pediatrics · Mental health & more
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
