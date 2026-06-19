import { BadgeCheck, IndianRupee, Shield, Video } from "lucide-react";

const items = [
  { icon: BadgeCheck, label: "Verified doctors" },
  { icon: Video, label: "Video from home" },
  { icon: IndianRupee, label: "Fees shown upfront" },
  { icon: Shield, label: "Private & secure" },
];

export function BookTrustStrip() {
  return (
    <ul className="flex flex-wrap gap-3 sm:gap-4">
      {items.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-xs font-medium text-[#0A1628] shadow-sm sm:text-sm"
        >
          <Icon className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  );
}
