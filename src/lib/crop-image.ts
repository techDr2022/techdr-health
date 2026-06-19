export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const OUTPUT_SIZE = 512;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Unable to load image for cropping.")));
    if (!src.startsWith("blob:")) {
      image.crossOrigin = "anonymous";
    }
    image.src = src;
  });
}

export async function cropImageToBlob(
  imageSrc: string,
  crop: CropArea,
  mimeType: string
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const size = Math.min(OUTPUT_SIZE, Math.max(crop.width, crop.height));
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to prepare cropped image.");

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size);

  const outputType = mimeType === "image/png" ? "image/png" : "image/jpeg";

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to create cropped image."));
          return;
        }
        resolve(blob);
      },
      outputType,
      outputType === "image/jpeg" ? 0.92 : undefined
    );
  });
}

export function blobToFile(blob: Blob, originalName: string, mimeType: string): File {
  const baseName = originalName.replace(/\.[^.]+$/, "") || "profile-photo";
  const ext =
    mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${baseName}-cropped.${ext}`, { type: mimeType });
}
