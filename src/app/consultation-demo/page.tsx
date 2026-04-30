import type { Metadata } from "next";
import { Video, Mic, MicOff, Camera, CameraOff, MessageSquare, FileText, Star } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { generateSEO } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
  title: "Video Consultation Demo",
  description:
    "Preview how a complete patient-doctor video consultation journey looks from waiting room to prescription summary.",
  path: "/consultation-demo",
});

const controls = [
  { label: "Mic", icon: Mic, active: true },
  { label: "Mute", icon: MicOff, active: false },
  { label: "Camera", icon: Camera, active: true },
  { label: "Stop Video", icon: CameraOff, active: false },
  { label: "Chat", icon: MessageSquare, active: true },
  { label: "Prescription", icon: FileText, active: true },
];

export default function ConsultationDemoPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-950 pt-24 text-slate-100">
        <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Sample Experience</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">How your video consultation will look</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
            This is a demo preview of the full flow: booking confirmation, waiting room checks, live consultation
            controls, and post-call prescription summary.
          </p>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-14 sm:px-6 lg:grid-cols-3 lg:px-8">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Step 1</p>
            <h2 className="mt-2 text-xl font-semibold">Booking Confirmed</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>Doctor: Dr. Kavya Menon (Cardiology)</li>
              <li>Date: 30 Apr 2026</li>
              <li>Time: 06:30 PM - 06:45 PM</li>
              <li>Status: Confirmed</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Step 2</p>
            <h2 className="mt-2 text-xl font-semibold">Waiting Room</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>Camera and mic test before joining</li>
              <li>Doctor availability indicator</li>
              <li>Patient notes and uploaded reports visible</li>
              <li>Join button appears before slot time</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Step 3</p>
            <h2 className="mt-2 text-xl font-semibold">Live Consultation</h2>
            <p className="mt-4 text-sm text-cyan-100">
              Secure video call with real-time chat, in-consult notes, and doctor prescription drafting.
            </p>
            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              <Video className="h-4 w-4" />
              Join Consultation
            </button>
          </article>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-cyan-900/20">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3 text-xs text-slate-400">
              <span>Live Room Preview</span>
              <span>00:08:42 elapsed</span>
            </div>
            <div className="grid gap-4 p-4 lg:grid-cols-[2fr,1fr]">
              <div className="relative min-h-[320px] rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 p-5">
                <div className="absolute right-4 top-4 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs">
                  Dr. Kavya Menon
                </div>
                <div className="mt-24 max-w-sm rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-200">
                  <p className="font-semibold text-white">Doctor Note</p>
                  <p className="mt-2">Mild viral fever, no red-flag symptoms. Hydration and 5-day medicine plan advised.</p>
                </div>
                <div className="absolute bottom-4 left-4 rounded-xl border border-slate-700 bg-slate-950/90 p-3 text-xs text-slate-300">
                  Patient: Ravi Teja
                </div>
              </div>

              <aside className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <h3 className="text-sm font-semibold">Consultation Controls</h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {controls.map((control) => {
                    const Icon = control.icon;
                    return (
                      <div
                        key={control.label}
                        className={`rounded-lg border px-3 py-2 text-xs ${
                          control.active
                            ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-100"
                            : "border-slate-800 bg-slate-900 text-slate-400"
                        }`}
                      >
                        <Icon className="mb-1 h-4 w-4" />
                        {control.label}
                      </div>
                    );
                  })}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">After Call</p>
              <h2 className="mt-2 text-2xl font-semibold">Prescription and Follow-up</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>Diagnosis summary shared instantly</li>
                <li>Medicine schedule and instructions in one view</li>
                <li>Downloadable prescription PDF</li>
                <li>Suggested follow-up date and reminders</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <h3 className="text-sm font-semibold">Patient Feedback Snapshot</h3>
              <div className="mt-3 flex items-center gap-1 text-amber-300">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
                <span className="ml-2 text-xs text-slate-300">5.0</span>
              </div>
              <p className="mt-3 text-sm text-slate-300">
                &quot;Video quality was clear, doctor explained everything, and prescription arrived immediately.&quot;
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
