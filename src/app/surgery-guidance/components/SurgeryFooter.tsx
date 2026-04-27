import Link from "next/link";

export function SurgeryFooter() {
  return (
    <footer className="border-t border-[#d6d2cc] bg-[#0b1f3a] px-6 py-10 text-[#faf7f2] md:px-[5%]">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-semibold">Surgery Guidance Hyderabad</h2>
          <p className="mt-2 max-w-xl text-sm text-[#dbe2eb]">
            Free patient guidance for surgery planning, second opinions, and hospital package comparison.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm md:items-end">
          <Link href="/surgery-guidance/blog" className="hover:text-[#c9983a]">Read surgery blog</Link>
          <Link href="/contact" className="hover:text-[#c9983a]">Request free guidance</Link>
        </div>
      </div>
    </footer>
  );
}
