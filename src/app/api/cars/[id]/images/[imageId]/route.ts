import { deleteCarImage } from "@/lib/cars";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string; imageId: string }> },
) {
  const { id, imageId } = await ctx.params;
  const result = await deleteCarImage(id, imageId);
  if (result === "missing-car") return jsonError("Car not found", 404);
  if (result === "missing-image") return jsonError("Image not found", 404);
  return new Response(null, { status: 204 });
}
