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
  if (src.startsWith("profile-photos/")) {
    return `/api/storage/r2-object?key=${encodeURIComponent(src)}`;
  }

  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:image/") ||
    src.startsWith("blob:")
  ) {
    return src;
  }

  if (src.startsWith("/")) {
    // Protect Next/Image from frequent 400s caused by broken ad-hoc local file names.
    const isLikelyLocalFile =
      /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(src) &&
      !src.startsWith("/images/") &&
      src !== "/techdrhealth-logo.png" &&
      src !== "/favicon.png";

    if (isLikelyLocalFile) return fallback;
    return src;
  }

  // Plain file names from legacy data are not guaranteed to exist in /public.
  return fallback;
}
