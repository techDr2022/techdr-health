"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { blobToFile, cropImageToBlob } from "@/lib/crop-image";
import {
  PROFILE_PHOTO_MAX_BYTES,
  PROFILE_PHOTO_MIME_TYPES,
} from "@/lib/doctor-profile-photo";
import { getSafeImageSrc } from "@/lib/image";

type AdminDoctorPhotoUploadProps = {
  doctorId: string;
  displayName: string;
  photoUrl: string | null;
  disabled?: boolean;
  compact?: boolean;
  onUploaded?: (photoUrl: string) => void;
};

export function AdminDoctorPhotoUpload({
  doctorId,
  displayName,
  photoUrl: initialPhotoUrl,
  disabled = false,
  compact = false,
  onUploaded,
}: AdminDoctorPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrlRef = useRef<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    setPhotoUrl(initialPhotoUrl);
  }, [initialPhotoUrl]);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  const resetCropState = useCallback(() => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
    setSelectedFile(null);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const closeCropModal = useCallback(() => {
    setCropOpen(false);
    resetCropState();
  }, [resetCropState]);

  function onCropComplete(_: Area, croppedPixels: Area) {
    setCroppedAreaPixels(croppedPixels);
  }

  function handleFileSelect(file: File) {
    setError(null);

    if (!PROFILE_PHOTO_MIME_TYPES.has(file.type)) {
      setError("Only JPG, PNG, and WEBP images are allowed.");
      return;
    }
    if (file.size > PROFILE_PHOTO_MAX_BYTES) {
      setError("Image must be under 5MB.");
      return;
    }

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;
    setSelectedFile(file);
    setImageSrc(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropOpen(true);
  }

  async function uploadPhoto(file: File) {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(`/api/admin/doctors/${doctorId}/photo`, {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as {
        photoUrl?: string;
        error?: string;
      } | null;

      if (!response.ok) throw new Error(payload?.error || "Unable to upload photo.");

      const nextPhotoUrl = payload?.photoUrl ?? photoUrl;
      if (nextPhotoUrl) {
        setPhotoUrl(nextPhotoUrl);
        onUploaded?.(nextPhotoUrl);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload photo.");
    } finally {
      setIsUploading(false);
    }
  }

  async function confirmCrop() {
    if (!selectedFile || !imageSrc || !croppedAreaPixels) {
      setError("Adjust the crop area before saving.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const croppedBlob = await cropImageToBlob(imageSrc, croppedAreaPixels, selectedFile.type);
      const croppedFile = blobToFile(croppedBlob, selectedFile.name, selectedFile.type);
      closeCropModal();
      await uploadPhoto(croppedFile);
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "Unable to crop photo.");
      setIsUploading(false);
    }
  }

  const previewSrc = getSafeImageSrc(photoUrl, "/images/placeholders/doctor-avatar.svg");
  const avatarSize = compact ? "h-11 w-11" : "h-20 w-20";

  return (
    <>
      <div className={compact ? "space-y-1" : "space-y-3"}>
        <div className={`flex items-center ${compact ? "gap-2" : "gap-4"}`}>
          <div className={`relative ${avatarSize} overflow-hidden rounded-full bg-slate-200 ring-2 ring-slate-100`}>
            <Image
              src={previewSrc}
              alt={displayName}
              fill
              className="object-cover"
              sizes={compact ? "44px" : "80px"}
            />
          </div>

          <div className={compact ? "min-w-0" : "space-y-2"}>
            {!compact ? (
              <div>
                <Label htmlFor={`doctor-photo-${doctorId}`}>Profile photo</Label>
                <p className="text-xs text-muted-foreground">
                  Square crop recommended. JPG, PNG, or WEBP up to 5MB.
                </p>
              </div>
            ) : null}

            <input
              ref={inputRef}
              id={`doctor-photo-${doctorId}`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={disabled || isUploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
            <label
              htmlFor={`doctor-photo-${doctorId}`}
              className={`inline-flex cursor-pointer items-center rounded-lg border border-input bg-white font-medium hover:bg-slate-50 ${
                compact ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-sm"
              } ${disabled || isUploading ? "pointer-events-none opacity-50" : ""}`}
            >
              {isUploading ? "Uploading..." : photoUrl ? "Change photo" : "Upload photo"}
            </label>
          </div>
        </div>

        {error ? (
          <p className={`text-red-600 ${compact ? "max-w-[140px] text-[11px]" : "text-sm"}`}>{error}</p>
        ) : null}
      </div>

      {cropOpen && imageSrc ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b px-5 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Crop profile photo</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Drag to reposition and use the slider to zoom before saving.
              </p>
            </div>

            <div className="relative h-72 bg-slate-950">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="space-y-2">
                <Label htmlFor={`doctor-photo-zoom-${doctorId}`}>Zoom</Label>
                <Slider
                  id={`doctor-photo-zoom-${doctorId}`}
                  min={1}
                  max={3}
                  step={0.05}
                  value={[zoom]}
                  onValueChange={(value) => {
                    const next = Array.isArray(value) ? value[0] : value;
                    setZoom(typeof next === "number" ? next : zoom);
                  }}
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeCropModal} disabled={isUploading}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void confirmCrop()} disabled={isUploading}>
                  {isUploading ? "Saving..." : "Save photo"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
