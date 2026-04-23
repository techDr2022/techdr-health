import { CalendarCheck, Stethoscope, Video } from "lucide-react";

const steps = [
  {
    title: "Choose Specialty",
    copy: "Filter by symptom, specialty, language, or insurance-friendly fee bands.",
    icon: Stethoscope,
  },
  {
    title: "Pick Your Doctor",
    copy: "Compare experience, ratings, and availability-profiles are credential-verified.",
    icon: CalendarCheck,
  },
  {
    title: "Start Video Consultation",
    copy: "Join a secure HD visit from your phone or laptop with clear follow-up notes.",
    icon: Video,
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="font-heading text-3xl font-semibold text-[#0A1628] sm:text-4xl">
          How it works
        </h2>
        <p className="mt-3 text-muted-foreground">
          Three calm steps from search to prescription-ready documentation-built
          for busy families and professionals.
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="relative rounded-2xl border border-border bg-white p-8 shadow-sm"
          >
            <span className="absolute -top-3 left-8 rounded-full bg-[#0EA5E9] px-3 py-0.5 text-xs font-semibold text-white">
              {i + 1}
            </span>
            <s.icon className="h-10 w-10 text-[#0EA5E9]" aria-hidden />
            <h3 className="mt-4 font-heading text-xl font-semibold text-[#0A1628]">
              {s.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {s.copy}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
