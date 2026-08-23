import {
  FEATURE_KEYS,
  carsQuerySchema,
  fuelTypeSchema,
  transmissionSchema,
  type CarsQuery,
  type FeatureKey,
  type FuelType,
  type RosterFacets,
  type Transmission,
} from "@/lib/car-schema";

export const ROSTER_FEATURE_CHIPS: { label: string; key: FeatureKey }[] = [
  { label: "CarPlay", key: "appleCarPlay" },
  { label: "ACC", key: "adaptiveCruise" },
  { label: "BSM", key: "blindSpotMonitor" },
  { label: "Camera", key: "rearviewCamera" },
  { label: "Sensors", key: "parkingSensorsRear" },
];

function firstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseCarsQuery(
  searchParams: Record<string, string | string[] | undefined>,
): CarsQuery {
  const raw: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    const text = firstString(value);
    if (text != null && text !== "") raw[key] = text;
  }
  const parsed = carsQuerySchema.safeParse(raw);
  return parsed.success ? parsed.data : {};
}

export function serializeCarsQuery(query: CarsQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.brand) params.set("brand", query.brand);
  if (query.fuel) params.set("fuel", query.fuel);
  if (query.transmission) params.set("transmission", query.transmission);
  if (query.minPriceCents != null) params.set("minPriceCents", String(query.minPriceCents));
  if (query.maxPriceCents != null) params.set("maxPriceCents", String(query.maxPriceCents));
  if (query.minOdometerKm != null) params.set("minOdometerKm", String(query.minOdometerKm));
  if (query.maxOdometerKm != null) params.set("maxOdometerKm", String(query.maxOdometerKm));
  if (query.sort) params.set("sort", query.sort);
  if (query.sortDir) params.set("sortDir", query.sortDir);
  for (const key of FEATURE_KEYS) {
    if (query[key] === true) params.set(key, "true");
  }
  return params;
}

export function carsHref(query: CarsQuery): string {
  const text = serializeCarsQuery(query).toString();
  return text ? `/?${text}` : "/";
}

function uniqueSortedBrands(brands: string[]): string[] {
  const byLower = new Map<string, string>();
  for (const brand of brands) {
    const trimmed = brand.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    const existing = byLower.get(key);
    if (!existing || trimmed.localeCompare(existing, "en") < 0) {
      byLower.set(key, trimmed);
    }
  }
  return [...byLower.values()].sort((a, b) => a.localeCompare(b, "en"));
}

function uniqueSorted<T extends string>(values: T[], label: (value: T) => string): T[] {
  return [...new Set(values)].sort((a, b) => label(a).localeCompare(label(b), "en"));
}

/** Distinct filter options from the full roster (not the current filtered subset). */
export function facetsFromCars(
  cars: Array<{ brand: string; fuelType: string | null; transmission: string | null }>,
): RosterFacets {
  const fuels: FuelType[] = [];
  const transmissions: Transmission[] = [];
  for (const car of cars) {
    const fuel = fuelTypeSchema.safeParse(car.fuelType);
    if (fuel.success) fuels.push(fuel.data);
    const transmission = transmissionSchema.safeParse(car.transmission);
    if (transmission.success) transmissions.push(transmission.data);
  }

  return {
    brands: uniqueSortedBrands(cars.map((car) => car.brand)),
    fuels: uniqueSorted(fuels, (value) => value),
    transmissions: uniqueSorted(transmissions, (value) => value),
  };
}

export function parseCompareIds(raw: string | string[] | undefined): string[] {
  const text = Array.isArray(raw) ? raw.join(",") : (raw ?? "");
  const ids = text
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return [...new Set(ids)].slice(0, 4);
}
