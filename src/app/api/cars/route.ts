import { parseCarCreate, parseCarsQuery, createCar, listCars } from "@/lib/cars";
import { jsonError, zodErrorResponse } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = parseCarsQuery(searchParams);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const cars = await listCars(parsed.data);
  return Response.json(cars);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = parseCarCreate(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const car = await createCar(parsed.data);
  return Response.json(car, { status: 201 });
}
