"use client";

import { motion } from "framer-motion";
import { Search, CreditCard, Video } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: Search,
    title: "Search & Filter",
    desc: "Search by symptom, speciality, or doctor name. Filter by language, fee, and availability.",
  },
  {
    num: "02",
    icon: CreditCard,
    title: "Book & Pay",
    desc: "Pick your slot and pay securely via Cashfree. Instant confirmation and reminder sent to you.",
  },
  {
    num: "03",
    icon: Video,
    title: "Consult & Heal",
    desc: "HD video call with your doctor. Get a digital prescription. Free follow-up within 7 days.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="mb-4 inline-flex items-center gap-2 font-body text-[11px] font-[700] uppercase tracking-[.1em] text-blue-600">
            <span className="block h-0.5 w-4 rounded bg-blue-500" />
            How It Works
          </span>
          <h2 className="font-display text-[clamp(28px,4vw,42px)] font-[800] leading-tight tracking-tight text-slate-900">
            From Search to Prescription
            <br />
            in Under 10 Minutes
          </h2>
        </motion.div>

        <div className="mt-14 grid rounded-2xl border border-slate-200 overflow-hidden md:grid-cols-3 md:divide-x md:divide-slate-200">
          {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group cursor-default border-b border-slate-200 bg-white p-9 transition-all duration-300 last:border-b-0 hover:bg-blue-950 md:border-b-0"
            >
              <span className="mb-6 block select-none font-display text-6xl font-[800] leading-none text-slate-100 transition-colors duration-300 group-hover:text-blue-400/20">
                {num}
              </span>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 transition-all duration-300 group-hover:border-blue-400/30 group-hover:bg-blue-500/15">
                <Icon className="h-5 w-5 text-blue-600 transition-colors duration-300 group-hover:text-blue-400" />
              </div>
              <h3 className="mb-2.5 font-display text-[17px] font-[700] text-slate-900 transition-colors duration-300 group-hover:text-white">
                {title}
              </h3>
              <p className="font-body text-[13px] leading-relaxed text-slate-500 transition-colors duration-300 group-hover:text-white/55">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
