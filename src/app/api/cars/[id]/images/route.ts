import { addCarImages, getCarById } from "@/lib/cars";
import { jsonError } from "@/lib/http";
import {
  ALLOWED_IMAGE_MIME,
  detectImageType,
  MAX_IMAGE_BYTES,
  saveCarImageFile,
} from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const car = await getCarById(id);
  if (!car) return jsonError("Car not found", 404);

  const form = await request.formData();
  const entries = form.getAll("files");
  if (entries.length === 0) {
    return jsonError("Expected multipart field `files` (jpeg/png/webp)", 400);
  }

  const saved: Array<{ relativePath: string; mimeType: string; originalName: string }> = [];

  for (const entry of entries) {
    if (typeof entry === "string") {
      return jsonError("Each `files` part must be a file", 400);
    }

    if (entry.size > MAX_IMAGE_BYTES) {
      return jsonError(`File too large (max ${MAX_IMAGE_BYTES} bytes)`, 413);
    }

    const bytes = new Uint8Array(await entry.arrayBuffer());
    const detected = detectImageType(bytes);
    if (!detected || !ALLOWED_IMAGE_MIME.has(detected.mimeType)) {
      return jsonError("Only jpeg, png, and webp images are allowed", 415);
    }

    const relativePath = saveCarImageFile(id, bytes, detected.ext);
    saved.push({
      relativePath,
      mimeType: detected.mimeType,
      originalName: entry.name || `image.${detected.ext}`,
    });
  }

  const updated = await addCarImages(id, saved);
  if (!updated) return jsonError("Car not found", 404);
  return Response.json(updated, { status: 201 });
}
