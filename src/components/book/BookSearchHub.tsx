"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { SPECIALTIES } from "@/data/specialties";
import { SpecialtyIcon } from "@/components/specialties/SpecialtyIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const POPULAR_SLUGS = [
  "general-medicine",
  "dermatology",
  "cardiology",
  "pediatrics",
  "psychiatry",
  "gynecology",
  "orthopedics",
  "ent",
  "diabetology",
  "gastroenterology",
];

type Props = {
  counts: Record<string, number>;
  initialQuery?: string;
  initialSpecialty?: string;
  resultCount: number;
  hasFilters?: boolean;
};

export function BookSearchHub({
  counts,
  initialQuery = "",
  initialSpecialty = "",
  resultCount,
  hasFilters = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  const current = useMemo(
    () => ({
      specialty: searchParams.get("specialty") ?? initialSpecialty,
      q: searchParams.get("q") ?? initialQuery,
      lang: searchParams.get("lang") ?? "",
      minRating: Number(searchParams.get("rating") ?? "0") || 0,
      maxFee: Number(searchParams.get("maxFee") ?? "3000") || 3000,
    }),
    [searchParams, initialSpecialty, initialQuery]
  );

  const activeFilterCount = [
    current.specialty,
    current.q,
    current.lang,
    current.minRating > 0 ? "rating" : "",
    current.maxFee < 3000 ? "fee" : "",
  ].filter(Boolean).length;

  const pushParams = useCallback(
    (next: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([k, v]) => {
        if (v === undefined || v === "" || v === "0") params.delete(k);
        else params.set(k, v);
      });
      startTransition(() => {
        router.push(`/book?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushParams({
      q: query.trim() || undefined,
      specialty: current.specialty || undefined,
    });
  }

  useEffect(() => {
    setQuery(current.q);
  }, [current.q]);

  useEffect(() => {
    const node = stickyRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 1, rootMargin: "-80px 0px 0px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const popular = POPULAR_SLUGS.map((slug) =>
    SPECIALTIES.find((s) => s.slug === slug)
  ).filter(Boolean) as typeof SPECIALTIES;

  const filterPanel = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Specialty</Label>
        <Select
          value={current.specialty || "all"}
          onValueChange={(v) =>
            pushParams({
              specialty: v && v !== "all" ? String(v) : undefined,
            })
          }
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="All specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All specialties</SelectItem>
            {SPECIALTIES.map((s) => (
              <SelectItem key={s.slug} value={s.slug}>
                {s.name}
                {(counts[s.slug] ?? 0) > 0 ? ` (${counts[s.slug]})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="book-lang">Language</Label>
        <Input
          id="book-lang"
          placeholder="e.g. Hindi, Tamil"
          defaultValue={current.lang}
          className="h-11"
          onBlur={(e) => pushParams({ lang: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <Label>Min. rating</Label>
          <span className="font-medium">{current.minRating.toFixed(1)}★</span>
        </div>
        <Slider
          value={[current.minRating]}
          max={5}
          step={0.5}
          onValueChange={(vals) => {
            const v = Array.isArray(vals) ? vals[0] : vals;
            pushParams({ rating: v ? String(v) : undefined });
          }}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <Label>Max fee (₹)</Label>
          <span className="font-medium">₹{current.maxFee}</span>
        </div>
        <Slider
          value={[current.maxFee]}
          min={300}
          max={3000}
          step={100}
          onValueChange={(vals) => {
            const v = Array.isArray(vals) ? vals[0] : vals;
            pushParams({ maxFee: v && v < 3000 ? String(v) : undefined });
          }}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          setQuery("");
          router.push("/book");
          setFiltersOpen(false);
        }}
      >
        Reset all filters
      </Button>
    </div>
  );

  return (
    <>
      <div ref={stickyRef} className="h-0" aria-hidden />

      <div
        className={cn(
          "z-40 transition-all duration-300",
          isSticky
            ? "fixed inset-x-0 top-[4.5rem] border-b border-emerald-100/80 bg-white/90 shadow-md backdrop-blur-xl"
            : "relative -mt-6"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              "rounded-2xl border border-emerald-100 bg-white shadow-lg shadow-emerald-900/5",
              isSticky ? "my-2 rounded-xl" : "p-1 sm:p-1.5"
            )}
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-2 sm:p-2"
            >
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search doctor, symptom, or condition…"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-10 text-base sm:h-11 sm:text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger
                    type="button"
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground sm:h-11 sm:flex-none"
                  >
                    <SlidersHorizontal className="h-4 w-4" aria-hidden />
                    Filters
                    {activeFilterCount > 0 ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0EA5E9] px-1.5 text-[10px] font-bold text-white">
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </SheetTrigger>
                  <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
                    <SheetHeader>
                      <SheetTitle>Refine your search</SheetTitle>
                    </SheetHeader>
                    <div className="overflow-y-auto px-4 pb-8">{filterPanel}</div>
                  </SheetContent>
                </Sheet>

                <Button
                  type="submit"
                  disabled={pending}
                  className="h-12 flex-1 rounded-xl bg-[#0EA5E9] px-6 hover:bg-[#0284C7] sm:h-11 sm:flex-none"
                >
                  {pending ? "Searching…" : "Search"}
                </Button>
              </div>
            </form>

            {!isSticky ? (
              <div className="border-t border-slate-100 px-3 pb-3 pt-2 sm:px-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Quick pick specialty
                  </p>
                  {hasFilters ? (
                    <span className="text-xs text-emerald-700">
                      {resultCount} doctors found
                    </span>
                  ) : null}
                </div>
                <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <Link
                    href="/book"
                    className={cn(
                      "snap-start shrink-0 inline-flex min-w-[88px] flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 transition-all active:scale-95",
                      !current.specialty
                        ? "border-[#0EA5E9] bg-[#0EA5E9]/10 shadow-sm"
                        : "border-slate-200 bg-slate-50 hover:border-[#0EA5E9]/40"
                    )}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#0EA5E9] shadow-sm">
                      <Filter className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="text-[11px] font-semibold text-[#0A1628]">
                      All
                    </span>
                  </Link>
                  {popular.map((specialty) => {
                    const isActive = current.specialty === specialty.slug;
                    const count = counts[specialty.slug] ?? 0;
                    return (
                      <Link
                        key={specialty.slug}
                        href={`/book?specialty=${specialty.slug}${current.q ? `&q=${encodeURIComponent(current.q)}` : ""}`}
                        className={cn(
                          "snap-start shrink-0 inline-flex min-w-[88px] flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 transition-all active:scale-95",
                          isActive
                            ? "border-[#0EA5E9] bg-[#0EA5E9]/10 shadow-sm"
                            : "border-slate-200 bg-slate-50 hover:border-[#0EA5E9]/40"
                        )}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#0EA5E9] shadow-sm">
                          <SpecialtyIcon
                            iconKey={specialty.iconKey}
                            className="h-4 w-4"
                          />
                        </span>
                        <span className="max-w-[72px] truncate text-[11px] font-semibold text-[#0A1628]">
                          {specialty.name.split(" ")[0]}
                        </span>
                        {count > 0 ? (
                          <span className="text-[10px] text-muted-foreground">
                            {count} live
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {isSticky ? <div className="h-[88px]" aria-hidden /> : null}

      {(current.specialty || current.q || activeFilterCount > 0) && (
        <div className="mx-auto mt-4 flex max-w-7xl flex-wrap items-center gap-2 px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-medium text-muted-foreground">Active:</span>
          {current.specialty ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0EA5E9]/10 px-3 py-1 text-xs font-semibold text-[#0369a1]">
              {SPECIALTIES.find((s) => s.slug === current.specialty)?.name}
              <button
                type="button"
                onClick={() => pushParams({ specialty: undefined })}
                className="ml-0.5 rounded-full p-0.5 hover:bg-[#0EA5E9]/20"
                aria-label="Remove specialty filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : null}
          {current.q ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              &ldquo;{current.q}&rdquo;
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  pushParams({ q: undefined });
                }}
                className="ml-0.5 rounded-full p-0.5 hover:bg-emerald-200"
                aria-label="Remove search filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : null}
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={() => router.push("/book")}
              className="text-xs font-semibold text-[#0EA5E9] hover:underline"
            >
              Clear all
            </button>
          ) : null}
        </div>
      )}
    </>
  );
}
