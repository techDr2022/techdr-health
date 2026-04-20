import { Clock, Globe, ShieldCheck, Users } from "lucide-react";

const stats = [
  { label: "Doctors on platform", value: "1000+", icon: Users },
  { label: "Medical specialties", value: "20+", icon: Globe },
  { label: "Telehealth coverage", value: "24/7", icon: Clock },
  { label: "Avg. wait time", value: "< 4 min", icon: ShieldCheck },
];

export function WhyChoose() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-white to-slate-50 px-6 py-12 shadow-sm sm:px-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-[#0A1628] sm:text-4xl">
              Why patients choose techDr Tele Health
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Medical-grade security, luxury-grade clarity. Every visit is
              documented, every specialist credentialed, and every fee shown
              before you confirm - so you can focus on getting better, not
              navigating paperwork.
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#10B981]" />
                Dedicated clinical workflows for chronic disease follow-up and
                second opinions.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0EA5E9]" />
                Integrated prescription documentation compatible with major
                pharmacy networks in India.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0A1628]" />
                Transparent consultation fees in INR - no surprise platform
                charges at checkout.
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-white p-6 shadow-sm"
              >
                <s.icon className="h-8 w-8 text-[#0EA5E9]" aria-hidden />
                <p className="mt-4 font-heading text-3xl font-semibold text-[#0A1628]">
                  {s.value}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
