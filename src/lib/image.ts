const ALLOWED_PUBLIC_ROOT_IMAGES = new Set([
  "/apple-touch-icon.png",
  "/closeup-family-talking-with-doctor-via-video-call-laptop-coronavirus-pandemic.webp",
  "/doctor-offering-medical-teleconsultation.webp",
  "/elderly-people-making-video-call.webp",
  "/female-patient-attending-virtual-consultation.webp",
  "/Online-Medical-Consultation-Desktop.webp",
  "/online-medical-consultation-with-doctor-via-video-call-laptop.webp",
  "/sick-patient-talking-doctor-telehealth-videocall-conference-using-computer-with-webcam-medical-consultation-online-videoconference-remote-telemedicine-virtual-meeting.webp",
  "/smiling-caucasian-female-doctor-medical-uniform-headphones-talk-video-call-computer-with-client-happy-woman-gp-earphones-have-online-webcam-digital-consultation-with-hospital-patient.webp",
  "/woman-having-appointment-with-doctor-videocall-using-laptop-telehealth-concept-online-consultation-with-professional-medical-clinic-general-practitioner-telemedicine-service.webp",
  "/woman-using-laptop-having-video-call-with-her-doctor-while-sitting-home.webp",
  "/young-asia-female-doctor-white-medical-uniform-with-stethoscope-using-computer-laptop-talking-video-conference-call.webp",
]);

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

    if (ALLOWED_PUBLIC_ROOT_IMAGES.has(src)) return src;
    if (isLikelyLocalFile) return fallback;
    return src;
  }

  // Plain file names from legacy data are not guaranteed to exist in /public.
  return fallback;
}
