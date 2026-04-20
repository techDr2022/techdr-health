"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-blue-950 p-8 md:p-12"
        >
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-80" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-[clamp(30px,4.4vw,48px)] font-[800] leading-tight tracking-tight text-white">
                Consult a Verified Specialist Today
              </h2>
              <p className="mt-3 max-w-2xl font-body text-[15px] leading-relaxed text-blue-100/80">
                Book a secure online consultation in minutes and get expert guidance from top doctors across India.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 md:w-[240px]">
              <Button asChild className="h-11 bg-blue-500 text-white shadow-lg shadow-blue-500/35 hover:bg-blue-400">
                <Link href="/consult">Book Consultation</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/doctors">Browse Doctors</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
