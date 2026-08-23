import {
  FEATURE_KEYS,
  FUEL_TYPES,
  SPEC_KEYS,
  TRANSMISSIONS,
  highwayKmPerLiter,
  type Car,
  type FeatureKey,
  type SpecKey,
} from "@/lib/car-schema";

export const MISSING = "—";

const eur = new Intl.NumberFormat("en-NL", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const km = new Intl.NumberFormat("en-NL");

const fuelLabels: Record<(typeof FUEL_TYPES)[number], string> = {
  petrol: "Petrol",
  diesel: "Diesel",
  hybrid: "Hybrid",
  plugin_hybrid: "Plug-in hybrid",
  electric: "Electric",
  lpg: "LPG",
  cng: "CNG",
  other: "Other",
};

const transmissionLabels: Record<(typeof TRANSMISSIONS)[number], string> = {
  manual: "Manual",
  automatic: "Automatic",
  dsg: "DSG",
  cvt: "CVT",
  other: "Other",
};

export function formatPriceCents(cents: number): string {
  return eur.format(cents / 100);
}

export function formatOdometerKm(value: number): string {
  return `${km.format(value)} km`;
}

export function formatApkDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatFuelType(value: Car["fuelType"]): string {
  if (value == null) return MISSING;
  return fuelLabels[value];
}

export function formatTransmission(value: Car["transmission"]): string {
  if (value == null) return MISSING;
  return transmissionLabels[value];
}

export function formatBool(value: boolean | null): string {
  if (value == null) return MISSING;
  return value ? "Yes" : "No";
}

export function formatConsumptionLPer100(value: number): string {
  const kmL = highwayKmPerLiter(value);
  const liters = `${value.toFixed(1)} L/100 km`;
  if (kmL == null) return liters;
  return `${liters} (${kmL.toFixed(1)} km/L)`;
}

export function specLabel(key: SpecKey): string {
  return SPEC_KEYS.find((item) => item.key === key)?.label ?? key;
}

export function formatSpecValue(car: Car, key: SpecKey): string {
  const value = car[key];
  if (value == null) return MISSING;

  switch (key) {
    case "priceCents":
      return formatPriceCents(value as number);
    case "odometerKm":
      return formatOdometerKm(value as number);
    case "apkValidUntil":
      return formatApkDate(value as string);
    case "fuelType":
      return formatFuelType(value as Car["fuelType"]);
    case "transmission":
      return formatTransmission(value as Car["transmission"]);
    case "highwayLPer100km":
    case "combinedLPer100km":
      return formatConsumptionLPer100(value as number);
    case "fuelTankLiters":
      return `${value} L`;
    case "trunkWidthMm":
    case "trunkHeightMm":
      return `${value} mm`;
    case "trunkLitersSeatsUp":
    case "trunkLitersSeatsFolded":
      return `${value} L`;
    case "horsepower":
      return `${value} hp`;
    case "torqueNm":
      return `${value} Nm`;
    case "gears":
    case "cylinders":
    case "year":
      return String(value);
    case "licensePlate":
      return String(value);
    default:
      if ((FEATURE_KEYS as readonly string[]).includes(key)) {
        return formatBool(value as boolean | null);
      }
      return String(value);
  }
}

export function carTitle(car: Car): string {
  return [car.brand, car.model, car.trim].filter(Boolean).join(" ");
}

export function imageSrc(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }
  return `/${path}`;
}

export function isFeatureKey(key: string): key is FeatureKey {
  return (FEATURE_KEYS as readonly string[]).includes(key);
}
