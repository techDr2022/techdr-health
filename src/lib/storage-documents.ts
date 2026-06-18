export const ONBOARDING_DOC_PREFIX = "onboarding-docs/";
export const PROFILE_PHOTO_PREFIX = "profile-photos/";

const ALLOWED_STORAGE_PREFIXES = [ONBOARDING_DOC_PREFIX, PROFILE_PHOTO_PREFIX];

export type DocumentPreviewKind = "image" | "pdf" | "unknown";

export function extensionForDocumentType(type: string) {
  if (type === "application/pdf") return "pdf";
  if (type === "image/jpeg" || type === "image/jpg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return null;
}

export function isAllowedStorageKey(key: string) {
  return ALLOWED_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function resolveStorageKey(value: string | null | undefined): string | null {
  const src = (value ?? "").trim();
  if (!src) return null;

  if (src.startsWith("/api/storage/r2-object") || src.startsWith("/api/admin/documents/preview")) {
    try {
      const url = new URL(src, "http://localhost");
      const key = url.searchParams.get("key")?.trim();
      return key && isAllowedStorageKey(key) ? key : null;
    } catch {
      return null;
    }
  }

  if (isAllowedStorageKey(src)) return src;

  for (const prefix of ALLOWED_STORAGE_PREFIXES) {
    const marker = `/${prefix}`;
    const markerIndex = src.indexOf(marker);
    if (markerIndex >= 0) {
      const key = `${prefix}${src.slice(markerIndex + marker.length)}`;
      return key;
    }
  }

  if (src.startsWith("http://") || src.startsWith("https://")) {
    try {
      const url = new URL(src);
      const key = url.pathname.replace(/^\/+/, "");
      return isAllowedStorageKey(key) ? key : null;
    } catch {
      return null;
    }
  }

  return null;
}

export function getAdminDocumentPreviewUrl(key: string) {
  return `/api/admin/documents/preview?key=${encodeURIComponent(key)}`;
}

export function getDocumentPreviewKind(
  value: string | null | undefined,
  key: string | null = resolveStorageKey(value)
): DocumentPreviewKind {
  const source = (key || value || "").toLowerCase();
  if (/\.(jpe?g|png|webp|gif|avif)$/.test(source)) return "image";
  if (/\.pdf$/.test(source)) return "pdf";
  return "unknown";
}

export function hasDocumentPreview(value: string | null | undefined) {
  return Boolean(resolveStorageKey(value));
}

export type LoadedDocumentPreview = {
  label: string;
  status: "missing" | "legacy" | "ready";
  fileName?: string;
  previewKind?: DocumentPreviewKind;
  previewSrc?: string;
};

export async function loadApplicationDocumentPreview(
  label: string,
  value: string | null | undefined
): Promise<LoadedDocumentPreview> {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return { label, status: "missing" };
  }

  const storageKey = resolveStorageKey(trimmed);
  if (!storageKey) {
    return { label, status: "legacy", fileName: trimmed };
  }

  const { getR2ObjectBuffer } = await import("@/lib/r2");
  const object = await getR2ObjectBuffer(storageKey);
  if (!object) {
    return { label, status: "legacy", fileName: trimmed };
  }

  const previewKind = getDocumentPreviewKind(trimmed, storageKey);
  const base64 = object.buffer.toString("base64");
  const previewSrc =
    previewKind === "image" || previewKind === "pdf"
      ? `data:${object.contentType};base64,${base64}`
      : undefined;

  return {
    label,
    status: "ready",
    fileName: storageKey.split("/").pop() || trimmed,
    previewKind,
    previewSrc,
  };
}

export async function loadApplicationDocumentPreviews(
  documents: Array<{ label: string; value: string | null }>
) {
  return Promise.all(documents.map((document) => loadApplicationDocumentPreview(document.label, document.value)));
}
