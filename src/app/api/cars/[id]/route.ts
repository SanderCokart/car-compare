import { deleteCar, getCarById, parseCarUpdate, updateCar } from "@/lib/cars";
import { jsonError, zodErrorResponse } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const car = await getCarById(id);
  if (!car) return jsonError("Car not found", 404);
  return Response.json(car);
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = parseCarUpdate(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const car = await updateCar(id, parsed.data);
  if (!car) return jsonError("Car not found", 404);
  return Response.json(car);
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const deleted = await deleteCar(id);
  if (!deleted) return jsonError("Car not found", 404);
  return new Response(null, { status: 204 });
}
