"use client";

import { useEffect, useState } from "react";
import { FREE_LISTING_LIMIT } from "@/lib/plans";

type FreeSlotsState = {
  freeSlotsRemaining: number;
};

export function FreeSlotsLeft({
  className,
  fallback = `${FREE_LISTING_LIMIT} free slots left`,
}: {
  className?: string;
  fallback?: string;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await fetch("/api/join/applications", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as FreeSlotsState;
        if (!isMounted || typeof data.freeSlotsRemaining !== "number") return;
        setRemaining(Math.max(data.freeSlotsRemaining, 0));
      } catch {
        // Ignore fetch errors and keep fallback text.
      }
    };

    void load();
    const intervalId = window.setInterval(() => {
      void load();
    }, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const label = remaining === null ? fallback : `${remaining} free slots left`;
  return <span className={className}>{label}</span>;
}
