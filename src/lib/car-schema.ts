/**
 * Merge contract for Wave 1 worktrees (API, UI, seed).
 * Do not change field names, nullability, or enum values without coordinating all three.
 */

import { z } from "zod";

/** Dutch-market fuel labels stored in English keys. */
export const FUEL_TYPES = [
  "petrol",
  "diesel",
  "hybrid",
  "plugin_hybrid",
  "electric",
  "lpg",
  "cng",
  "other",
] as const;

export const TRANSMISSIONS = [
  "manual",
  "automatic",
  "dsg",
  "cvt",
  "other",
] as const;

/** GET /api/cars `sort` query values. */
export const SORT_KEYS = [
  "price",
  "odometer",
  "year",
  "horsepower",
  "consumption",
] as const;

export const fuelTypeSchema = z.enum(FUEL_TYPES);
export const transmissionSchema = z.enum(TRANSMISSIONS);
export const sortKeySchema = z.enum(SORT_KEYS);

export type FuelType = z.infer<typeof fuelTypeSchema>;
export type Transmission = z.infer<typeof transmissionSchema>;
export type SortKey = z.infer<typeof sortKeySchema>;

/** Distinct brand / fuel / transmission values present on the full roster. */
export type RosterFacets = {
  brands: string[];
  fuels: FuelType[];
  transmissions: Transmission[];
};

const nullableString = z.string().nullable();
const nullablePositiveInt = z.number().int().positive().nullable();
const nullableNonNegInt = z.number().int().nonnegative().nullable();
const nullableFinite = z.number().finite().nullable();
const nullableBool = z.boolean().nullable();

/** YYYY-MM-DD (APK expiry) or null. */
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .nullable();

export const FEATURE_KEYS = [
  "blindSpotMonitor",
  "parkingSensorsFront",
  "parkingSensorsRear",
  "androidAuto",
  "appleCarPlay",
  "rearviewCamera",
  "radarEmergencyBraking",
  "upgradedRims",
  "adaptiveCruise",
  "adaptiveCruiseStopGo",
  "steeringAid",
  "hillHold",
  "cruiseControl",
  "speedLimiter",
  "foldingMirrors",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

const featureFields = {
  blindSpotMonitor: nullableBool,
  parkingSensorsFront: nullableBool,
  parkingSensorsRear: nullableBool,
  androidAuto: nullableBool,
  appleCarPlay: nullableBool,
  rearviewCamera: nullableBool,
  radarEmergencyBraking: nullableBool,
  upgradedRims: nullableBool,
  adaptiveCruise: nullableBool,
  adaptiveCruiseStopGo: nullableBool,
  steeringAid: nullableBool,
  hillHold: nullableBool,
  cruiseControl: nullableBool,
  speedLimiter: nullableBool,
  foldingMirrors: nullableBool,
} as const;

/** Writable car fields. Required: brand, model, priceCents. All other listing fields nullable. */
export const carFieldsSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  trim: nullableString,
  year: nullablePositiveInt,
  priceCents: z.number().int().nonnegative(),
  listingUrl: z.string().url().nullable(),

  odometerKm: nullableNonNegInt,
  fuelType: fuelTypeSchema.nullable(),
  transmission: transmissionSchema.nullable(),
  gears: nullablePositiveInt,
  horsepower: nullablePositiveInt,
  torqueNm: nullablePositiveInt,
  cylinders: nullablePositiveInt,
  licensePlate: nullableString,
  apkValidUntil: isoDateSchema,

  sellerName: nullableString,
  sellerCity: nullableString,
  sellerAddress: nullableString,

  trunkWidthMm: nullableNonNegInt,
  trunkHeightMm: nullableNonNegInt,
  trunkLitersSeatsUp: nullableNonNegInt,
  trunkLitersSeatsFolded: nullableNonNegInt,
  fuelTankLiters: nullableFinite,

  ...featureFields,

  /** Litres per 100 km at highway / 100 km/h. UI derives km/L as `100 / L`. */
  highwayLPer100km: nullableFinite,
  combinedLPer100km: nullableFinite,
});

export type CarFields = z.infer<typeof carFieldsSchema>;

export const carCreateSchema = carFieldsSchema;
export type CarCreate = z.infer<typeof carCreateSchema>;

export const carUpdateSchema = carFieldsSchema.partial();
export type CarUpdate = z.infer<typeof carUpdateSchema>;

export const carImageSchema = z.object({
  id: z.string().min(1),
  carId: z.string().min(1),
  /** Volume-relative path, e.g. `uploads/<carId>/<file>`. Served via `/uploads/...`. */
  path: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
  mimeType: z.string().nullable(),
  originalName: z.string().nullable(),
});

export type CarImage = z.infer<typeof carImageSchema>;
export type CarImageRecord = CarImage;

export const carRecordSchema = carFieldsSchema.extend({
  id: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  images: z.array(carImageSchema),
});

export type CarRecord = z.infer<typeof carRecordSchema>;
export type Car = CarRecord;

const optionalFlag = z.coerce.boolean().optional();

/** GET /api/cars query string (after URLSearchParams parsing). */
export const carsQuerySchema = z.object({
  brand: z.string().min(1).optional(),
  fuel: fuelTypeSchema.optional(),
  transmission: transmissionSchema.optional(),
  minPriceCents: z.coerce.number().int().nonnegative().optional(),
  maxPriceCents: z.coerce.number().int().nonnegative().optional(),
  minOdometerKm: z.coerce.number().int().nonnegative().optional(),
  maxOdometerKm: z.coerce.number().int().nonnegative().optional(),
  sort: sortKeySchema.optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  blindSpotMonitor: optionalFlag,
  parkingSensorsFront: optionalFlag,
  parkingSensorsRear: optionalFlag,
  androidAuto: optionalFlag,
  appleCarPlay: optionalFlag,
  rearviewCamera: optionalFlag,
  radarEmergencyBraking: optionalFlag,
  upgradedRims: optionalFlag,
  adaptiveCruise: optionalFlag,
  adaptiveCruiseStopGo: optionalFlag,
  steeringAid: optionalFlag,
  hillHold: optionalFlag,
  cruiseControl: optionalFlag,
  speedLimiter: optionalFlag,
  foldingMirrors: optionalFlag,
});

export type CarsQuery = z.infer<typeof carsQuerySchema>;

export const SPEC_GROUPS = [
  "basics",
  "drivetrain",
  "safety",
  "comfort",
  "cargo",
] as const;

export type SpecGroup = (typeof SPEC_GROUPS)[number];

/**
 * Selectable keys for the “What is most important to you?” modal.
 * `key` matches a `CarFields` property (or identity price/odometer/APK/fuel).
 */
export const SPEC_KEYS = [
  { key: "priceCents", group: "basics", label: "Price" },
  { key: "odometerKm", group: "basics", label: "Odometer" },
  { key: "apkValidUntil", group: "basics", label: "APK valid until" },
  { key: "fuelType", group: "basics", label: "Fuel type" },
  { key: "year", group: "basics", label: "Year" },
  { key: "licensePlate", group: "basics", label: "License plate" },
  { key: "transmission", group: "drivetrain", label: "Transmission" },
  { key: "gears", group: "drivetrain", label: "Gears" },
  { key: "horsepower", group: "drivetrain", label: "Horsepower" },
  { key: "torqueNm", group: "drivetrain", label: "Torque" },
  { key: "cylinders", group: "drivetrain", label: "Cylinders" },
  { key: "highwayLPer100km", group: "drivetrain", label: "Highway consumption" },
  { key: "combinedLPer100km", group: "drivetrain", label: "Combined consumption" },
  { key: "fuelTankLiters", group: "drivetrain", label: "Fuel tank" },
  { key: "blindSpotMonitor", group: "safety", label: "Blind-spot monitor" },
  { key: "radarEmergencyBraking", group: "safety", label: "Emergency braking" },
  { key: "adaptiveCruise", group: "safety", label: "Adaptive cruise" },
  { key: "adaptiveCruiseStopGo", group: "safety", label: "ACC Stop & Go" },
  { key: "parkingSensorsFront", group: "safety", label: "Front parking sensors" },
  { key: "parkingSensorsRear", group: "safety", label: "Rear parking sensors" },
  { key: "rearviewCamera", group: "safety", label: "Rearview camera" },
  { key: "hillHold", group: "safety", label: "Hill hold" },
  { key: "speedLimiter", group: "safety", label: "Speed limiter" },
  { key: "androidAuto", group: "comfort", label: "Android Auto" },
  { key: "appleCarPlay", group: "comfort", label: "Apple CarPlay" },
  { key: "cruiseControl", group: "comfort", label: "Cruise control" },
  { key: "steeringAid", group: "comfort", label: "Steering aid" },
  { key: "foldingMirrors", group: "comfort", label: "Folding mirrors" },
  { key: "upgradedRims", group: "comfort", label: "Upgraded rims" },
  { key: "trunkWidthMm", group: "cargo", label: "Trunk width" },
  { key: "trunkHeightMm", group: "cargo", label: "Trunk height" },
  { key: "trunkLitersSeatsUp", group: "cargo", label: "Trunk liters (seats up)" },
  {
    key: "trunkLitersSeatsFolded",
    group: "cargo",
    label: "Trunk liters (seats folded)",
  },
] as const satisfies ReadonlyArray<{
  key: keyof CarFields;
  group: SpecGroup;
  label: string;
}>;

export type SpecKey = (typeof SPEC_KEYS)[number]["key"];

export const SPEC_KEY_VALUES = SPEC_KEYS.map((s) => s.key) as [
  SpecKey,
  ...SpecKey[],
];

export const specKeySchema = z.enum(SPEC_KEY_VALUES);

/** Default priority-strip selection (localStorage). */
export const DEFAULT_PRIORITY_SPEC_KEYS = [
  "priceCents",
  "odometerKm",
  "apkValidUntil",
  "fuelType",
  "adaptiveCruise",
  "appleCarPlay",
  "androidAuto",
] as const satisfies ReadonlyArray<SpecKey>;

export type DefaultPrioritySpecKey = (typeof DEFAULT_PRIORITY_SPEC_KEYS)[number];

export const prioritySpecKeysSchema = z.array(specKeySchema);

export const KENTEKEN_RDW_OVI_URL = "https://ovi.rdw.nl/";
export const KENTEKEN_RDW_OVI_DEFAULT_URL = "https://ovi.rdw.nl/default.aspx";

export function finnikKentekenUrl(normalizedPlate: string): string {
  return `https://www.finnik.nl/kenteken/${normalizedPlate}`;
}

export function googleMapsEmbedUrl(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

/** UI helper: km/L from L/100 km. Returns null when missing or non-positive. */
export function highwayKmPerLiter(highwayLPer100km: number | null): number | null {
  if (highwayLPer100km == null || highwayLPer100km <= 0) return null;
  return 100 / highwayLPer100km;
}
