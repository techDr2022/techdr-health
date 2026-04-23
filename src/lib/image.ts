export function getSafeImageSrc(
  value: string | null | undefined,
  fallback: string
): string {
  const src = (value ?? "").trim();
  if (!src) return fallback;

  if (
    src.startsWith("/") ||
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:image/")
  ) {
    return src;
  }

  return fallback;
}
