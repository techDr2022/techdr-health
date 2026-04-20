import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SPECIALTIES } from "@/data/specialties";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#0EA5E9]">
        404
      </p>
      <h1 className="mt-4 font-heading text-4xl font-semibold text-[#0A1628]">
        Page not found
      </h1>
      <p className="mt-4 text-muted-foreground">
        The link may be outdated or the page moved—try our specialty hubs or doctor
        directory.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/doctors">Browse doctors</Link>
        </Button>
      </div>
      <div className="mt-14 text-left">
        <p className="text-sm font-semibold text-[#0A1628]">Popular specialties</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {SPECIALTIES.slice(0, 8).map((s) => (
            <li key={s.slug}>
              <Link
                href={`/specialties/${s.slug}`}
                className="text-[#0EA5E9] hover:underline"
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
