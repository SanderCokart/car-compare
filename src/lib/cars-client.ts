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

async function fetchJson(url: string): Promise<{ status: number; json: unknown }> {
  const response = await fetch(url, { cache: "no-store" });
  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }
  return { status: response.status, json };
}

function isServer() {
  return typeof window === "undefined";
}

/**
 * GET `/api/cars`. Server Components read SQLite through the same helpers as the
 * route handlers. HTTP is used on the client. Mock data is only used when both fail.
 * An empty roster is a valid API result and does not fall back to mocks.
 */
export async function listCars(
  query: CarsQuery = {},
  options: ListCarsOptions = {},
): Promise<Car[]> {
  if (isServer()) {
    try {
      const { listCars: listCarsFromDb } = await import("@/lib/cars");
      return listCarsFromDb(query);
    } catch {
      // Fall through to HTTP, then mock.
    }
  }

  const params = serializeCarsQuery(query).toString();
  const path = params ? `/api/cars?${params}` : "/api/cars";
  try {
    const { status, json } = await fetchJson(carsUrl(path, options.origin));
    if (!status || status >= 500) throw new Error(`HTTP ${status}`);
    if (status >= 400) throw new Error(`HTTP ${status}`);
    return parseCarsPayload(json);
  } catch {
    return filterAndSortCars(MOCK_CARS, query);
  }
}

/** GET `/api/cars/[id]`. 404 / missing car is `null`, not mock data. */
export async function getCar(
  id: string,
  options: ListCarsOptions = {},
): Promise<Car | null> {
  if (isServer()) {
    try {
      const { getCarById } = await import("@/lib/cars");
      return getCarById(id);
    } catch {
      // Fall through to HTTP, then mock.
    }
  }

  try {
    const { status, json } = await fetchJson(
      carsUrl(`/api/cars/${encodeURIComponent(id)}`, options.origin),
    );
    if (status === 404) return null;
    if (status >= 400) throw new Error(`HTTP ${status}`);
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
