import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site-config";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({
  items,
}: {
  items: Crumb[];
}) {
  const base = getSiteUrl();
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: item.href ? `${base}${item.href}` : `${base}`,
    })),
  };

  return (
    <>
      <JsonLd data={ld} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1 sm:gap-2">
          {items.map((item, i) => (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
