export function getSafeImageSrc(
  value: string | null | undefined,
  fallback: string
): string {
  const src = (value ?? "").trim();
  if (!src) return fallback;

  const marker = "/profile-photos/";
  const markerIndex = src.indexOf(marker);
  if (markerIndex >= 0) {
    const key = `profile-photos/${src.slice(markerIndex + marker.length)}`;
    return `/api/storage/r2-object?key=${encodeURIComponent(key)}`;
  }

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
