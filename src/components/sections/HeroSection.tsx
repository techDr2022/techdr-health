"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck2, Search, ShieldCheck, Video } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SPECIALTIES = [
  { name: "General Medicine", icon: "🩺", href: "/doctors/general-medicine" },
  { name: "Cardiology", icon: "❤️", href: "/doctors/cardiology" },
  { name: "Dermatology", icon: "🧴", href: "/doctors/dermatology" },
  { name: "Pediatrics", icon: "👶", href: "/doctors/pediatrics" },
  { name: "Psychiatry", icon: "🧠", href: "/doctors/psychiatry" },
  { name: "Gynecology", icon: "👩‍⚕️", href: "/doctors/gynecology" },
  { name: "Orthopedics", icon: "🦴", href: "/doctors/orthopedics" },
  { name: "Ophthalmology", icon: "👁️", href: "/doctors/ophthalmology" },
  { name: "ENT", icon: "👂", href: "/doctors/ent" },
  { name: "Neurology", icon: "🔬", href: "/doctors/neurology" },
];

const STATS = [
  { value: "100+", label: "Verified Doctors" },
  { value: "20+", label: "Specialities" },
  { value: "50K+", label: "Consultations Done" },
  { value: "4.9★", label: "Patient Rating" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("All Specialities");
  const heroBackground = useMemo(
    () =>
      "radial-gradient(circle at 15% 20%, rgba(6,182,212,.28) 0%, transparent 42%), radial-gradient(circle at 85% 10%, rgba(59,130,246,.3) 0%, transparent 45%), linear-gradient(120deg, #020617 0%, #0f172a 45%, #111827 100%)",
    []
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams({ q: query, specialty, type: "video" });
    router.push(`/doctors?${p.toString()}`);
  }

  return (
    <section className="relative isolate overflow-hidden pt-24 text-white">
      <div className="absolute inset-0 -z-20" style={{ background: heroBackground }} />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:56px_56px]" />

      <div
        className="pointer-events-none absolute -right-32 -top-40 -z-10 h-[600px] w-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,.22) 0%, transparent 65%)", filter: "blur(1px)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-[400px] w-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,.22) 0%, transparent 65%)" }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        <motion.div
          {...fadeUp(0)}
          className="mx-auto max-w-5xl rounded-3xl border border-cyan-200/40 bg-white/[0.1] p-5 shadow-[0_30px_120px_rgba(2,6,23,.5)] ring-4 ring-cyan-300/50 backdrop-blur-xl sm:p-7"
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-cyan-300 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-950">
              Quick booking
            </span>
            <span className="inline-flex items-center rounded-full border border-emerald-300/70 bg-emerald-400/20 px-3 py-1 text-[11px] font-semibold text-emerald-100">
              Video consultations only
            </span>
          </div>
          <p className="mb-4 text-sm font-semibold text-white/90">Quick booking</p>
          <motion.form
            onSubmit={handleSearch}
            className="space-y-4"
          >
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-300">Symptoms or doctor name</span>
              <div className="flex h-12 items-center gap-2 rounded-xl border border-cyan-200/80 bg-white px-3 shadow-lg shadow-cyan-500/20">
                <Search className="h-4 w-4 text-cyan-300" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Fever, migraine, Dr. Sharma..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
                />
              </div>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-300">Speciality</span>
                <Select
                  value={specialty}
                  onValueChange={(value) => setSpecialty(value ?? "All Specialities")}
                >
                  <SelectTrigger className="h-12 w-full rounded-xl border-white/15 bg-slate-900/30 px-3 text-sm text-white data-placeholder:text-slate-300">
                    <SelectValue placeholder="All Specialities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Specialities">All Specialities</SelectItem>
                    {SPECIALTIES.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <div className="rounded-xl border border-emerald-300/60 bg-emerald-500/15 px-3 py-2.5">
                <p className="text-xs font-medium text-emerald-200">Consultation mode</p>
                <p className="mt-1 text-sm font-semibold text-white">Video calls only</p>
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-cyan-300 text-sm font-extrabold text-slate-950 shadow-xl shadow-cyan-300/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-200"
            >
              Find available doctors
            </button>
          </motion.form>

          <div className="mt-5 grid gap-2 text-xs text-slate-200 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <CalendarCheck2 className="mb-2 h-4 w-4 text-cyan-300" />
              Same-day slots
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <Video className="mb-2 h-4 w-4 text-cyan-300" />
              HD video calls
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <Search className="mb-2 h-4 w-4 text-cyan-300" />
              Fast specialist search
            </div>
          </div>
        </motion.div>

        <div className="mt-12 text-center">
          <motion.div
            {...fadeUp(0.1)}
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/[0.16] bg-white/[0.06] px-4 py-2"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-body text-xs font-semibold tracking-wide text-cyan-100">
              Encrypted teleconsultations with verified doctors
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.16)}
            className="mx-auto max-w-4xl font-display text-[clamp(34px,6vw,62px)] font-[800] leading-[1.05] tracking-[-0.03em] text-white"
          >
            Modern Healthcare,
            <span className="mt-2 block text-cyan-300">At Home in Minutes.</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="mx-auto mt-6 max-w-2xl font-body text-base leading-relaxed text-slate-200/90"
          >
            Schedule secure video consultations with trusted specialists, get quick follow-ups, and keep all your
            records in one professional care platform.
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/consult"
              className="inline-flex h-12 items-center justify-center rounded-full bg-cyan-400 px-6 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-400/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-300"
            >
              Schedule Consultation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/doctors"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Browse Specialists
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0.28)} className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-left">
                <p className="font-display text-xl font-bold text-white">{value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-300">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <motion.div
          {...fadeUp(0.28)}
          className="flex flex-wrap justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3"
        >
          {SPECIALTIES.slice(0, 8).map(({ name, icon, href }) => (
            <Link
              key={name}
              href={href}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.14] bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-white/80 transition-all duration-200 hover:border-cyan-300/40 hover:bg-cyan-400/15 hover:text-white"
            >
              <span className="text-[14px]">{icon}</span>
              {name}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
