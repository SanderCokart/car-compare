import { z } from "zod";
import { carRecordSchema, type Car, type CarsQuery } from "@/lib/car-schema";
import { serializeCarsQuery } from "@/lib/cars-query";
import { MOCK_CARS, filterAndSortCars } from "@/lib/cars-mock";

const carsListSchema = z.union([
  z.array(carRecordSchema),
  z.object({ cars: z.array(carRecordSchema) }),
]);

export type ListCarsOptions = {
  origin?: string;
};

function carsUrl(path: string, origin?: string): string {
  if (!origin) return path;
  return new URL(path, origin).toString();
}

function parseCarsPayload(json: unknown): Car[] {
  const parsed = carsListSchema.parse(json);
  return Array.isArray(parsed) ? parsed : parsed.cars;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/** GET `/api/cars`. Falls back to typed mock data when the API is missing. */
export async function listCars(
  query: CarsQuery = {},
  options: ListCarsOptions = {},
): Promise<Car[]> {
  const params = serializeCarsQuery(query).toString();
  const path = params ? `/api/cars?${params}` : "/api/cars";
  try {
    return parseCarsPayload(await fetchJson(carsUrl(path, options.origin)));
  } catch {
    return filterAndSortCars(MOCK_CARS, query);
  }
}

/** GET `/api/cars/[id]`. Falls back to mock when the API is missing. */
export async function getCar(
  id: string,
  options: ListCarsOptions = {},
): Promise<Car | null> {
  try {
    const json = await fetchJson(
      carsUrl(`/api/cars/${encodeURIComponent(id)}`, options.origin),
    );
    return carRecordSchema.parse(json);
  } catch {
    return MOCK_CARS.find((car) => car.id === id) ?? null;
  }
}

export async function getCarsByIds(
  ids: string[],
  options: ListCarsOptions = {},
): Promise<Car[]> {
  const unique = [...new Set(ids)];
  const cars = await Promise.all(unique.map((id) => getCar(id, options)));
  const byId = new Map(
    cars.filter((car): car is Car => car != null).map((car) => [car.id, car]),
  );
  return unique.flatMap((id) => {
    const car = byId.get(id);
    return car ? [car] : [];
  });
}
