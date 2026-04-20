"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SPECIALTIES } from "@/data/specialties";

type Props = {
  defaultSpecialty?: string;
};

export function DoctorFilters({ defaultSpecialty }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const current = useMemo(() => {
    return {
      specialty: searchParams.get("specialty") ?? defaultSpecialty ?? "",
      lang: searchParams.get("lang") ?? "",
      q: searchParams.get("q") ?? "",
      minExperience: Number(searchParams.get("minExp") ?? "0") || 0,
      minRating: Number(searchParams.get("rating") ?? "0") || 0,
      maxFee: Number(searchParams.get("maxFee") ?? "2500") || 2500,
      availableOnly: searchParams.get("available") === "1",
    };
  }, [searchParams, defaultSpecialty]);

  const pushParams = useCallback(
    (next: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([k, v]) => {
        if (v === undefined || v === "" || v === "0") params.delete(k);
        else params.set(k, v);
      });
      params.delete("page");
      startTransition(() => {
        router.push(`/doctors?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <aside className="space-y-6 rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="font-heading text-lg font-semibold text-[#0A1628]">
          Filters
        </p>
        {pending ? (
          <span className="text-xs text-muted-foreground">Updating…</span>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="spec">Specialty</Label>
        <Select
          value={current.specialty || "all"}
          onValueChange={(v) => {
            const next =
              v && v !== "all" ? String(v) : undefined;
            pushParams({ specialty: next });
          }}
        >
          <SelectTrigger id="spec">
            <SelectValue placeholder="All specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All specialties</SelectItem>
            {SPECIALTIES.map((s) => (
              <SelectItem key={s.slug} value={s.slug}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="q">Search</Label>
        <input
          id="q"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Name, credential, keyword"
          defaultValue={current.q}
          onBlur={(e) => pushParams({ q: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lang-input">Language</Label>
        <input
          id="lang-input"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="e.g. Hindi"
          defaultValue={current.lang}
          onBlur={(e) => pushParams({ lang: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <Label>Min. experience (years)</Label>
          <span>{current.minExperience}</span>
        </div>
        <Slider
          value={[current.minExperience]}
          max={25}
          step={1}
          onValueChange={(vals) => {
            const arr = Array.isArray(vals) ? vals : [vals];
            const v = arr[0];
            pushParams({ minExp: v != null ? String(v) : undefined });
          }}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <Label>Min. rating</Label>
          <span>{current.minRating.toFixed(1)}</span>
        </div>
        <Slider
          value={[current.minRating]}
          max={5}
          step={0.1}
          onValueChange={(vals) => {
            const arr = Array.isArray(vals) ? vals : [vals];
            const v = arr[0];
            pushParams({ rating: v != null ? String(v) : undefined });
          }}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <Label>Max fee (₹)</Label>
          <span>{current.maxFee}</span>
        </div>
        <Slider
          value={[current.maxFee]}
          min={300}
          max={3000}
          step={50}
          onValueChange={(vals) => {
            const arr = Array.isArray(vals) ? vals : [vals];
            const v = arr[0];
            pushParams({ maxFee: v != null ? String(v) : undefined });
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="avail"
          checked={current.availableOnly}
          onCheckedChange={(c) =>
            pushParams({ available: c === true ? "1" : undefined })
          }
        />
        <Label htmlFor="avail" className="text-sm font-normal cursor-pointer">
          Available now
        </Label>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => router.push("/doctors")}
      >
        Clear filters
      </Button>
    </aside>
  );
}
