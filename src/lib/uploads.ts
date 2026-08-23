import fs from "node:fs";
import path from "node:path";
import { UPLOADS_DIR } from "@/lib/db";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const MIME_TO_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type DetectedImage = {
  mimeType: keyof typeof MIME_TO_EXT;
  ext: string;
};

export function detectImageType(bytes: Uint8Array): DetectedImage | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mimeType: "image/jpeg", ext: MIME_TO_EXT["image/jpeg"] };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { mimeType: "image/png", ext: MIME_TO_EXT["image/png"] };
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { mimeType: "image/webp", ext: MIME_TO_EXT["image/webp"] };
  }
  return null;
}

function assertInsideUploads(absolutePath: string) {
  const root = path.resolve(UPLOADS_DIR);
  const resolved = path.resolve(absolutePath);
  const prefix = root.endsWith(path.sep) ? root : root + path.sep;
  if (resolved !== root && !resolved.startsWith(prefix)) {
    throw new Error("Invalid upload path");
  }
}

/** DB path `uploads/<carId>/<file>` -> absolute file under `data/uploads`. */
export function absoluteUploadPath(relativePath: string): string {
  const normalized = relativePath.replaceAll("\\", "/").replace(/^\/+/, "");
  const withoutPrefix = normalized.startsWith("uploads/")
    ? normalized.slice("uploads/".length)
    : normalized;
  const absolute = path.resolve(UPLOADS_DIR, ...withoutPrefix.split("/").filter(Boolean));
  assertInsideUploads(absolute);
  return absolute;
}

export function saveCarImageFile(carId: string, bytes: Uint8Array, ext: string): string {
  const dir = path.join(process.cwd(), "data", "uploads", carId);
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${crypto.randomUUID()}.${ext}`;
  const absolute = path.join(process.cwd(), "data", "uploads", carId, filename);
  assertInsideUploads(absolute);
  fs.writeFileSync(absolute, bytes);
  return `uploads/${carId}/${filename}`;
}

export function unlinkUploadIfExists(relativePath: string) {
  try {
    const absolute = absoluteUploadPath(relativePath);
    if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
  } catch {
    // Ignore missing or invalid paths on delete.
  }
}

export function deleteCarUploadDir(carId: string) {
  const dir = path.join(UPLOADS_DIR, carId);
  assertInsideUploads(dir);
  fs.rmSync(dir, { recursive: true, force: true });
}
