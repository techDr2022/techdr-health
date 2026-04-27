import Link from "next/link";

export function HeroSection() {
  return (
    <section className="bg-[#0b1f3a] px-6 py-20 text-white md:px-[5%]">
      <div className="mx-auto max-w-7xl">
        <header>
          <h1 className="max-w-3xl font-display text-4xl font-bold md:text-5xl">
            Free surgery guidance in Hyderabad with NABH hospitals and expert surgeons
          </h1>
          <p className="mt-4 max-w-3xl text-base text-[#dbe2eb]">
            Compare 2-3 treatment packages, get transparent estimates, and plan your surgery journey with no patient charges.
          </p>
        </header>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/contact" aria-label="Get free surgery guidance" className="rounded-full bg-[#c9983a] px-8 py-3 font-bold text-[#0b1f3a] hover:bg-yellow-400">
            Get Free Guidance
          </Link>
          <Link href="/surgery-guidance/blog" aria-label="Explore surgery blog" className="rounded-full border-2 border-white px-8 py-3 text-white hover:bg-white/10">
            Explore Blog
          </Link>
        </div>
      </div>
    </section>
  );
}
