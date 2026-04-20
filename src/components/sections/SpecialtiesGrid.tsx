"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SPECIALTIES = [
  { name: "General Medicine", icon: "🩺", count: "2,400+ doctors", slug: "general-medicine" },
  { name: "Cardiology", icon: "❤️", count: "600+ doctors", slug: "cardiology" },
  { name: "Dermatology", icon: "🧴", count: "900+ doctors", slug: "dermatology" },
  { name: "Pediatrics", icon: "👶", count: "1,100+ doctors", slug: "pediatrics" },
  { name: "Gynecology", icon: "👩‍⚕️", count: "850+ doctors", slug: "gynecology" },
  { name: "Orthopedics", icon: "🦴", count: "500+ doctors", slug: "orthopedics" },
  { name: "Psychiatry", icon: "🧠", count: "420+ doctors", slug: "psychiatry" },
  { name: "Neurology", icon: "🔬", count: "300+ doctors", slug: "neurology" },
  { name: "Ophthalmology", icon: "👁️", count: "650+ doctors", slug: "ophthalmology" },
  { name: "ENT", icon: "👂", count: "520+ doctors", slug: "ent" },
];

export function SpecialtiesGrid() {
  return (
    <section className="bg-slate-50 py-24">
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
              Specialities
            </span>
            <h2 className="font-display text-[clamp(28px,4vw,42px)] font-[800] leading-tight tracking-tight text-slate-900">
              Find Care by Specialty
            </h2>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {SPECIALTIES.map((specialty, i) => (
            <motion.div
              key={specialty.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
            >
              <Link
                href={`/doctors/${specialty.slug}`}
                className="block rounded-2xl border-[1.5px] border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-[0_12px_35px_rgba(35,72,196,0.14)]"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  {specialty.icon}
                </div>
                <h3 className="font-display text-[17px] font-[700] text-slate-900">{specialty.name}</h3>
                <p className="mt-1 font-body text-[12px] text-slate-400">{specialty.count}</p>
              </Link>
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
          <Button variant="ghost" asChild className="text-blue-700 hover:bg-blue-50 hover:text-blue-800">
            <Link href="/specialties">
              View All Specialities <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
