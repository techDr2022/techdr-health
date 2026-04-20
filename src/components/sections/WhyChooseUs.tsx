"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: "🔒",
    title: "Secure & Private",
    desc: "Your consultations and records are encrypted end-to-end and protected with strict privacy standards.",
  },
  {
    icon: "✅",
    title: "Verified Doctors Only",
    desc: "Every doctor is credential-verified and approved before being listed on TechDrHealth.",
  },
  {
    icon: "⚡",
    title: "Instant Availability",
    desc: "Find available specialists now and connect in minutes without long waiting lines.",
  },
  {
    icon: "📋",
    title: "Digital Prescriptions",
    desc: "Receive clear digital prescriptions immediately after your consultation.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-blue-950 py-24">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-90" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 max-w-2xl"
        >
          <span className="mb-3 inline-flex items-center gap-2 font-body text-[11px] font-[700] uppercase tracking-[.1em] text-blue-300">
            <span className="block h-0.5 w-4 rounded bg-blue-400" />
            Why Choose Us
          </span>
          <h2 className="font-display text-[clamp(28px,4vw,42px)] font-[800] leading-tight tracking-tight text-white">
            Built for Fast, Reliable, Modern Teleconsultation
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:bg-blue-500/10"
            >
              <div className="mb-4 text-3xl">{feature.icon}</div>
              <h3 className="mb-2 font-display text-[22px] font-[700] text-white">{feature.title}</h3>
              <p className="font-body text-[14px] leading-relaxed text-blue-100/80">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
