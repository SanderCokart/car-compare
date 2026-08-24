import {
  FEATURE_KEYS,
  fuelTypeSchema,
  transmissionSchema,
  type CarsQuery,
  type FeatureKey,
  type FuelType,
  type RosterFacetBounds,
  type RosterFacets,
  type Transmission,
} from "@/lib/car-schema";

export type FilterableCar = {
  brand: string;
  model: string;
  trim: string | null;
  year: number | null;
  priceCents: number;
  odometerKm: number | null;
  fuelType: string | null;
  transmission: string | null;
  horsepower: number | null;
  cylinders: number | null;
  licensePlate: string | null;
  sellerName: string | null;
  sellerCity: string | null;
} & Record<FeatureKey, boolean | null>;

const DEFAULT_BOUNDS: RosterFacetBounds = {
  yearMin: 1990,
  yearMax: new Date().getFullYear(),
  priceCentsMin: 0,
  priceCentsMax: 2_500_000,
  odometerKmMin: 0,
  odometerKmMax: 200_000,
  horsepowerMin: 0,
  horsepowerMax: 400,
  cylindersMin: 2,
  cylindersMax: 12,
};

function sameText(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function includesInsensitive(haystack: string | null | undefined, needle: string): boolean {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(needle);
}

function inRange(value: number | null, min?: number, max?: number): boolean {
  if (min == null && max == null) return true;
  if (value == null) return false;
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}

export function carMatchesQuery(car: FilterableCar, query: CarsQuery): boolean {
  if (query.q) {
    const needle = query.q.trim().toLowerCase();
    if (needle) {
      const hit =
        includesInsensitive(car.brand, needle) ||
        includesInsensitive(car.model, needle) ||
        includesInsensitive(car.trim, needle) ||
        includesInsensitive(car.licensePlate, needle) ||
        includesInsensitive(car.sellerName, needle) ||
        includesInsensitive(car.sellerCity, needle);
      if (!hit) return false;
    }
  }

  if (query.brand && !sameText(car.brand, query.brand)) return false;
  if (query.model && !sameText(car.model, query.model)) return false;
  if (query.fuel && car.fuelType !== query.fuel) return false;
  if (query.transmission && car.transmission !== query.transmission) return false;

  if (!inRange(car.year, query.minYear, query.maxYear)) return false;
  if (!inRange(car.priceCents, query.minPriceCents, query.maxPriceCents)) return false;
  if (!inRange(car.odometerKm, query.minOdometerKm, query.maxOdometerKm)) return false;
  if (!inRange(car.horsepower, query.minHorsepower, query.maxHorsepower)) return false;
  if (!inRange(car.cylinders, query.minCylinders, query.maxCylinders)) return false;

  for (const key of FEATURE_KEYS) {
    if (query[key] === true && car[key] !== true) return false;
  }

  return true;
}

export function filterCars<T extends FilterableCar>(cars: T[], query: CarsQuery): T[] {
  return cars.filter((car) => carMatchesQuery(car, query));
}

function uniqueSortedLabels(values: string[]): string[] {
  const byLower = new Map<string, string>();
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    const existing = byLower.get(key);
    if (!existing || trimmed.localeCompare(existing, "en") < 0) {
      byLower.set(key, trimmed);
    }
  }
  return [...byLower.values()].sort((a, b) => a.localeCompare(b, "en"));
}

function countMatching(cars: FilterableCar[], query: CarsQuery): number {
  let count = 0;
  for (const car of cars) {
    if (carMatchesQuery(car, query)) count += 1;
  }
  return count;
}

function minMax(values: Array<number | null>, fallbackMin: number, fallbackMax: number) {
  const nums = values.filter((value): value is number => value != null);
  if (nums.length === 0) return { min: fallbackMin, max: fallbackMax };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

function emptyFeatureCounts(): Record<FeatureKey, number> {
  return Object.fromEntries(FEATURE_KEYS.map((key) => [key, 0])) as Record<FeatureKey, number>;
}

function boundsFromCars(cars: FilterableCar[]): RosterFacetBounds {
  const year = minMax(
    cars.map((car) => car.year),
    DEFAULT_BOUNDS.yearMin,
    DEFAULT_BOUNDS.yearMax,
  );
  const price = minMax(
    cars.map((car) => car.priceCents),
    DEFAULT_BOUNDS.priceCentsMin,
    DEFAULT_BOUNDS.priceCentsMax,
  );
  const odometer = minMax(
    cars.map((car) => car.odometerKm),
    DEFAULT_BOUNDS.odometerKmMin,
    DEFAULT_BOUNDS.odometerKmMax,
  );
  const horsepower = minMax(
    cars.map((car) => car.horsepower),
    DEFAULT_BOUNDS.horsepowerMin,
    DEFAULT_BOUNDS.horsepowerMax,
  );
  const cylinders = minMax(
    cars.map((car) => car.cylinders),
    DEFAULT_BOUNDS.cylindersMin,
    DEFAULT_BOUNDS.cylindersMax,
  );

  return {
    yearMin: year.min,
    yearMax: year.max,
    priceCentsMin: Math.min(DEFAULT_BOUNDS.priceCentsMin, price.min),
    priceCentsMax: Math.max(DEFAULT_BOUNDS.priceCentsMax, price.max),
    odometerKmMin: Math.min(DEFAULT_BOUNDS.odometerKmMin, odometer.min),
    odometerKmMax: Math.max(DEFAULT_BOUNDS.odometerKmMax, odometer.max),
    horsepowerMin: Math.min(DEFAULT_BOUNDS.horsepowerMin, horsepower.min),
    horsepowerMax: Math.max(DEFAULT_BOUNDS.horsepowerMax, horsepower.max),
    cylindersMin: Math.min(DEFAULT_BOUNDS.cylindersMin, cylinders.min),
    cylindersMax: Math.max(DEFAULT_BOUNDS.cylindersMax, cylinders.max),
  };
}

/**
 * Option counts answer “how many cars remain if this value is applied”.
 * Exclusive dims (brand/model/fuel/transmission) replace the current value so
 * switching stays visible; a zero means the rest of the query already rules it out.
 * Features are additive: count = current query plus that flag set to true.
 */
export function buildRosterFacets(cars: FilterableCar[], query: CarsQuery = {}): RosterFacets {
  const brands = uniqueSortedLabels(cars.map((car) => car.brand));
  const brandForModels = query.brand;
  const modelSource = brandForModels
    ? cars.filter((car) => sameText(car.brand, brandForModels))
    : cars;
  const models = uniqueSortedLabels(modelSource.map((car) => car.model));

  const fuels: FuelType[] = [];
  const transmissions: Transmission[] = [];
  for (const car of cars) {
    const fuel = fuelTypeSchema.safeParse(car.fuelType);
    if (fuel.success && !fuels.includes(fuel.data)) fuels.push(fuel.data);
    const transmission = transmissionSchema.safeParse(car.transmission);
    if (transmission.success && !transmissions.includes(transmission.data)) {
      transmissions.push(transmission.data);
    }
  }
  fuels.sort((a, b) => a.localeCompare(b, "en"));
  transmissions.sort((a, b) => a.localeCompare(b, "en"));

  const withoutBrand = { ...query, brand: undefined, model: undefined };
  const withoutModel = { ...query, model: undefined };
  const withoutFuel = { ...query, fuel: undefined };
  const withoutTransmission = { ...query, transmission: undefined };

  const features = emptyFeatureCounts();
  for (const key of FEATURE_KEYS) {
    features[key] = countMatching(cars, { ...query, [key]: true });
  }

  return {
    brands: brands.map((value) => ({
      value,
      count: countMatching(cars, { ...withoutBrand, brand: value }),
    })),
    models: models.map((value) => ({
      value,
      count: countMatching(cars, { ...withoutModel, model: value }),
    })),
    fuels: fuels.map((value) => ({
      value,
      count: countMatching(cars, { ...withoutFuel, fuel: value }),
    })),
    transmissions: transmissions.map((value) => ({
      value,
      count: countMatching(cars, { ...withoutTransmission, transmission: value }),
    })),
    features,
    bounds: boundsFromCars(cars),
  };
}

const SORT_AND_DIR = new Set(["sort", "sortDir"]);

export function queryHasConstraints(query: CarsQuery): boolean {
  for (const [key, value] of Object.entries(query)) {
    if (SORT_AND_DIR.has(key)) continue;
    if (value === true || (typeof value === "string" && value.trim() !== "")) return true;
    if (typeof value === "number") return true;
  }
  return false;
}
