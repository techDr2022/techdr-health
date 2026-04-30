"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Shield, Star, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FreeSlotsLeft } from "@/components/join/FreeSlotsLeft";

function AnimatedCounter({
  to,
  suffix = "",
  prefix = "",
  duration = 1400,
  divisor = 1,
  decimals = 0,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  divisor?: number;
  decimals?: number;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(to * eased));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [to, duration]);

  return (
    <span>
      {prefix}
      {(value / divisor).toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0A1628] via-[#0d1f3a] to-[#0A1628] text-[#F8FAFC]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <svg
          className="h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 1200 400"
          aria-hidden
        >
          <defs>
            <linearGradient id="hx" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0" />
              <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0 220 Q 150 180 300 220 T 600 220 T 900 220 T 1200 220"
            fill="none"
            stroke="url(#hx)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.4, ease: "easeInOut" }}
          />
          <motion.path
            d="M0 260 Q 200 300 400 260 T 800 260 T 1200 260"
            fill="none"
            stroke="#0EA5E9"
            strokeOpacity="0.25"
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.8, ease: "easeInOut", delay: 0.2 }}
          />
        </svg>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24 lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#7dd3fc] ring-1 ring-white/10">
            <Video className="h-3.5 w-3.5" aria-hidden />
            Teleconsultation India · 1000+ specialists
          </p>
          <h1 className="mt-6 font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem] text-balance">
            Online Doctor Consultation India - 1000+ Verified Specialists
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300 leading-relaxed">
            Book video doctor consultation with verified physicians across
            cardiology, dermatology, mental health, and 20+ specialties.
            Trusted teleconsultation platform for patients across India with
            HIPAA-style privacy practices.
          </p>
          <p className="mt-4 inline-flex items-center rounded-full border border-emerald-200/60 bg-emerald-400/25 px-4 py-1.5 text-sm font-extrabold uppercase tracking-wide text-emerald-50 shadow-lg shadow-emerald-900/20">
            First 500 Doctors Join Free - <FreeSlotsLeft fallback="500 free slots left" className="ml-1" />
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-[#0EA5E9] text-white hover:bg-[#0284C7] shadow-lg shadow-[#0EA5E9]/25"
            >
              <Link href="/book" data-analytics-event="book_consultation_hero">
                Book Consultation Now
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/doctors">Browse Doctors</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-emerald-300/60 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20"
            >
              <Link href="/join">Claim Free Doctor Slot</Link>
            </Button>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(
              [
                ["HIPAA Compliant", Shield],
                ["Verified Doctors", BadgeCheck],
                ["4.9★ Rating", Star],
                ["50,000+ Consultations", Users],
              ] as [string, LucideIcon][]
            ).map(([label, Icon]) => (
              <div
                key={String(label)}
                className="rounded-xl bg-white/5 px-3 py-3 ring-1 ring-white/10"
              >
                <Icon className="h-5 w-5 text-[#38bdf8]" aria-hidden />
                <dt className="sr-only">{label}</dt>
                <dd className="mt-2 text-xs font-medium leading-snug text-slate-200">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-3 shadow-2xl backdrop-blur-sm">
            <div className="relative overflow-hidden rounded-2xl border border-white/20">
              <div className="relative aspect-[16/11]">
                <Image
                  src="/smiling-caucasian-female-doctor-medical-uniform-headphones-talk-video-call-computer-with-client-happy-woman-gp-earphones-have-online-webcam-digital-consultation-with-hospital-patient.webp"
                  alt="Doctor in video teleconsultation"
                  fill
                  priority
                  unoptimized
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 42vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081326]/70 via-[#081326]/15 to-transparent" />
              </div>
            </div>

            <div className="absolute left-6 top-6 rounded-xl border border-white/20 bg-[#0A1628]/70 px-3 py-2 text-xs text-slate-200 backdrop-blur-md">
              Live video consultation
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-emerald-100 bg-white/95 px-3 py-2 text-center shadow-md">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Doctors</p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  <AnimatedCounter to={1000} suffix="+" />
                </p>
              </div>
              <div className="rounded-xl border border-sky-100 bg-white/95 px-3 py-2 text-center shadow-md">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Rating</p>
                <p className="mt-1 text-sm font-semibold text-sky-700">
                  <AnimatedCounter to={49} divisor={10} decimals={1} suffix="★" />
                </p>
              </div>
              <div className="rounded-xl border border-cyan-100 bg-white/95 px-3 py-2 text-center shadow-md">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Consults</p>
                <p className="mt-1 text-sm font-semibold text-cyan-700">
                  <AnimatedCounter to={50000} suffix="+" />
                </p>
              </div>
              <div className="rounded-xl border border-violet-100 bg-white/95 px-3 py-2 text-center shadow-md">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Cities</p>
                <p className="mt-1 text-sm font-semibold text-violet-700">
                  <AnimatedCounter to={120} suffix="+" />
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
