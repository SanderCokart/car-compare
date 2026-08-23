import fs from "node:fs";
import path from "node:path";
import { absoluteUploadPath } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(_request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await ctx.params;
  const relative = ["uploads", ...segments].join("/");

  let absolute: string;
  try {
    absolute = absoluteUploadPath(relative);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(absolute).toLowerCase();
  const contentType = MIME_BY_EXT[ext];
  if (!contentType) return new Response("Not found", { status: 404 });

  const body = fs.readFileSync(absolute);
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
