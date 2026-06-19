import { CalendarCheck, Search, Video } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find your doctor",
    copy: "Pick a specialty or search by name",
  },
  {
    icon: CalendarCheck,
    title: "Choose date & time",
    copy: "Select a slot that works for you",
  },
  {
    icon: Video,
    title: "Join video call",
    copy: "Consult from your phone or laptop",
  },
];

export function BookSteps() {
  return (
    <ol className="grid gap-4 sm:grid-cols-3">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex items-start gap-3 rounded-xl border border-emerald-100/80 bg-white/80 p-4"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0EA5E9] text-xs font-bold text-white">
            {index + 1}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <step.icon className="h-4 w-4 text-[#0EA5E9]" aria-hidden />
              <p className="text-sm font-semibold text-[#0A1628]">{step.title}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {step.copy}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
