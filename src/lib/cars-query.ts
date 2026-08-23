import {
  FEATURE_KEYS,
  carsQuerySchema,
  type CarsQuery,
  type FeatureKey,
} from "@/lib/car-schema";
import { buildRosterFacets, type FilterableCar } from "@/lib/cars-filter";

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

function parseFlag(value: string): boolean | undefined {
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return undefined;
  return true;
}

export function parseCarsQuery(
  searchParams: Record<string, string | string[] | undefined>,
): CarsQuery {
  const raw: Record<string, string | boolean> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    const text = firstString(value)?.trim();
    if (text == null || text === "") continue;
    raw[key] = text;
  }
  for (const key of FEATURE_KEYS) {
    const value = raw[key];
    if (typeof value !== "string") continue;
    const flag = parseFlag(value);
    if (flag === true) raw[key] = true;
    else delete raw[key];
  }
  const parsed = carsQuerySchema.safeParse(raw);
  return parsed.success ? parsed.data : {};
}

export function serializeCarsQuery(query: CarsQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.brand) params.set("brand", query.brand);
  if (query.model) params.set("model", query.model);
  if (query.fuel) params.set("fuel", query.fuel);
  if (query.transmission) params.set("transmission", query.transmission);
  if (query.minYear != null) params.set("minYear", String(query.minYear));
  if (query.maxYear != null) params.set("maxYear", String(query.maxYear));
  if (query.minPriceCents != null) params.set("minPriceCents", String(query.minPriceCents));
  if (query.maxPriceCents != null) params.set("maxPriceCents", String(query.maxPriceCents));
  if (query.minOdometerKm != null) params.set("minOdometerKm", String(query.minOdometerKm));
  if (query.maxOdometerKm != null) params.set("maxOdometerKm", String(query.maxOdometerKm));
  if (query.minHorsepower != null) params.set("minHorsepower", String(query.minHorsepower));
  if (query.maxHorsepower != null) params.set("maxHorsepower", String(query.maxHorsepower));
  if (query.minCylinders != null) params.set("minCylinders", String(query.minCylinders));
  if (query.maxCylinders != null) params.set("maxCylinders", String(query.maxCylinders));
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

/** Distinct filter options and remainder counts from the full roster. */
export function facetsFromCars(cars: FilterableCar[], query: CarsQuery = {}) {
  return buildRosterFacets(cars, query);
}

export function parseCompareIds(raw: string | string[] | undefined): string[] {
  const text = Array.isArray(raw) ? raw.join(",") : (raw ?? "");
  const ids = text
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return [...new Set(ids)].slice(0, 4);
}
