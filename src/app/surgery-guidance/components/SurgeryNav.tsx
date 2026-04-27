import Link from "next/link";

const links = [
  { href: "/surgery-guidance", label: "Overview" },
  { href: "/surgery-guidance/blog", label: "Blog" },
  { href: "/contact", label: "Talk to Us" },
];

export function SurgeryNav() {
  return (
    <nav aria-label="Surgery guidance navigation" className="sticky top-0 z-30 border-b border-[#d6d2cc] bg-[#faf7f2]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-[5%]">
        <Link href="/surgery-guidance" className="font-display text-lg font-semibold text-[#0b1f3a]">
          Surgery Guidance Hyderabad
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium text-[#1a2a3a]">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[#0d7a6e]" aria-label={link.label}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
