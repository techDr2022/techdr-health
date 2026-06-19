import Link from "next/link";
import { MEDICAL_TOURS_INDIA_URL } from "@/lib/site-config";

export function MedicalTourism() {
  return (
    <section className="bg-[#0d7a6e] px-6 py-20 text-white md:px-[5%]" aria-labelledby="medical-tourism-heading">
      <div className="mx-auto max-w-7xl">
        <h2 id="medical-tourism-heading" className="font-display text-3xl">Medical tourism support</h2>
        <p className="mt-4 max-w-3xl text-[#d9fff8]">
          International patients receive visa guidance, airport pickup coordination, hospital admission support, and recovery stay planning.
        </p>
        <Link
          href={MEDICAL_TOURS_INDIA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0d7a6e] transition-colors hover:bg-emerald-50"
        >
          Get Treatment Estimate
        </Link>
      </div>
    </section>
  );
}
