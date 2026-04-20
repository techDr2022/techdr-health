"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { DoctorCard } from "@/components/ui/DoctorCard";
import { Button } from "@/components/ui/button";

type FeaturedDoctor = {
  name: string;
  specialty: string;
  credentials: string;
  experience: number;
  rating: number;
  reviewCount: number;
  consultFee: number;
  languages: string[];
  isAvailable: boolean;
  initials: string;
  slug: string;
  nextSlot?: string;
  patientCount?: number;
};

const FALLBACK_DOCTORS: FeaturedDoctor[] = [
  {
    name: "Ananya Sharma",
    specialty: "General Medicine",
    credentials: "MBBS, MD",
    experience: 11,
    rating: 4.9,
    reviewCount: 1284,
    consultFee: 499,
    languages: ["English", "Hindi"],
    isAvailable: true,
    initials: "AS",
    slug: "ananya-sharma",
    nextSlot: "Today, 05:30 PM",
    patientCount: 7200,
  },
  {
    name: "Rohit Menon",
    specialty: "Cardiology",
    credentials: "MBBS, DM Cardio",
    experience: 15,
    rating: 4.8,
    reviewCount: 964,
    consultFee: 899,
    languages: ["English", "Hindi", "Malayalam"],
    isAvailable: true,
    initials: "RM",
    slug: "rohit-menon",
    nextSlot: "Today, 06:15 PM",
    patientCount: 5400,
  },
  {
    name: "Nisha Verma",
    specialty: "Dermatology",
    credentials: "MBBS, MD Dermatology",
    experience: 9,
    rating: 4.9,
    reviewCount: 1450,
    consultFee: 699,
    languages: ["English", "Hindi"],
    isAvailable: false,
    initials: "NV",
    slug: "nisha-verma",
    nextSlot: "Tomorrow, 10:00 AM",
    patientCount: 6100,
  },
];

export function FeaturedDoctors() {
  const [doctors, setDoctors] = useState<FeaturedDoctor[]>(FALLBACK_DOCTORS);

  useEffect(() => {
    let mounted = true;

    async function loadFeaturedDoctors() {
      try {
        const res = await fetch("/api/doctors?featured=true&limit=3", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as FeaturedDoctor[];
        if (mounted && Array.isArray(data) && data.length > 0) {
          setDoctors(data);
        }
      } catch {
        // Keep fallback cards when API is unavailable.
      }
    }

    loadFeaturedDoctors();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span className="mb-3 inline-flex items-center gap-2 font-body text-[11px] font-[700] uppercase tracking-[.1em] text-blue-600">
              <span className="block h-0.5 w-4 rounded bg-blue-500" />
              Featured Doctors
            </span>
            <h2 className="font-display text-[clamp(28px,4vw,42px)] font-[800] leading-tight tracking-tight text-slate-900">
              Trusted by Thousands of Patients
            </h2>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor, i) => (
            <motion.div
              key={doctor.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <DoctorCard {...doctor} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="mt-10 flex justify-center"
        >
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
            <Link href="/doctors">
              Browse All Doctors <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
