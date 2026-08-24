import {
  FEATURE_KEYS,
  type Car,
  type CarFields,
  type CarsQuery,
  type FeatureKey,
} from "@/lib/car-schema";
import { filterCars } from "@/lib/cars-filter";

const stamp = "2026-01-15T12:00:00.000Z";

const emptyFeatures = Object.fromEntries(
  FEATURE_KEYS.map((key) => [key, null]),
) as Pick<CarFields, FeatureKey>;

function mockCar(
  id: string,
  fields: Omit<CarFields, FeatureKey> & Partial<Pick<CarFields, FeatureKey>>,
): Car {
  return {
    ...emptyFeatures,
    ...fields,
    id,
    createdAt: stamp,
    updatedAt: stamp,
    images: [],
  };
}

/** Typed stand-in listings so the UI can render without `/api/cars`. */
export const MOCK_CARS: Car[] = [
  mockCar("mock-polo-trendline", {
    brand: "Volkswagen",
    model: "Polo",
    trim: "1.0 MPI Trendline",
    year: 2018,
    priceCents: 1_095_000,
    listingUrl: "https://example.com/polo-trendline",
    odometerKm: 84_936,
    fuelType: "petrol",
    transmission: "manual",
    gears: 5,
    horsepower: 65,
    torqueNm: 95,
    cylinders: 3,
    licensePlate: "HVR-40-Z",
    apkValidUntil: "2026-11-07",
    sellerName: "Korteland",
    sellerCity: "Rijswijk",
    sellerAddress: "Oranjelaan 42, 2281 GE Rijswijk",
    trunkWidthMm: null,
    trunkHeightMm: null,
    trunkLitersSeatsUp: null,
    trunkLitersSeatsFolded: null,
    fuelTankLiters: 40,
    androidAuto: true,
    appleCarPlay: true,
    cruiseControl: true,
    radarEmergencyBraking: true,
    highwayLPer100km: 5.2,
    combinedLPer100km: 5.8,
  }),
  mockCar("mock-polo-2019", {
    brand: "Volkswagen",
    model: "Polo",
    trim: "1.0 TSI",
    year: 2019,
    priceCents: 1_249_000,
    listingUrl: "https://example.com/polo-2019",
    odometerKm: 98_400,
    fuelType: "petrol",
    transmission: "manual",
    gears: 5,
    horsepower: 95,
    torqueNm: 175,
    cylinders: 3,
    licensePlate: null,
    apkValidUntil: "2027-03-12",
    sellerName: "Autotrack dealer",
    sellerCity: "Utrecht",
    sellerAddress: null,
    trunkWidthMm: null,
    trunkHeightMm: null,
    trunkLitersSeatsUp: 351,
    trunkLitersSeatsFolded: null,
    fuelTankLiters: 40,
    appleCarPlay: true,
    androidAuto: true,
    parkingSensorsRear: true,
    rearviewCamera: false,
    highwayLPer100km: 4.9,
    combinedLPer100km: 5.4,
  }),
  mockCar("mock-polo-comfortline", {
    brand: "Volkswagen",
    model: "Polo",
    trim: "1.0 TSI Comfortline Business",
    year: 2020,
    priceCents: 1_344_500,
    listingUrl: "https://example.com/polo-comfortline",
    odometerKm: 72_210,
    fuelType: "petrol",
    transmission: "manual",
    gears: 5,
    horsepower: 95,
    torqueNm: 175,
    cylinders: 3,
    licensePlate: "K-112-AB",
    apkValidUntil: "2027-08-01",
    sellerName: "Motorhuis",
    sellerCity: "Den Haag",
    sellerAddress: "Binckhorstlaan 36, 2516 BE Den Haag",
    trunkWidthMm: null,
    trunkHeightMm: null,
    trunkLitersSeatsUp: null,
    trunkLitersSeatsFolded: null,
    fuelTankLiters: null,
    adaptiveCruise: true,
    appleCarPlay: true,
    androidAuto: true,
    parkingSensorsFront: true,
    parkingSensorsRear: true,
    rearviewCamera: true,
    upgradedRims: true,
    highwayLPer100km: 4.7,
    combinedLPer100km: 5.1,
  }),
  mockCar("mock-polo-life", {
    brand: "Volkswagen",
    model: "Polo",
    trim: "1.0 TSI Life",
    year: 2022,
    priceCents: 1_399_900,
    listingUrl: "https://example.com/polo-life",
    odometerKm: 112_923,
    fuelType: "petrol",
    transmission: "automatic",
    gears: 7,
    horsepower: 95,
    torqueNm: 175,
    cylinders: 3,
    licensePlate: "P-529-SR",
    apkValidUntil: "2028-04-08",
    sellerName: "Neologistics",
    sellerCity: "Den Haag",
    sellerAddress: "Groenewegje 154, 2515 NC Den Haag",
    trunkWidthMm: null,
    trunkHeightMm: null,
    trunkLitersSeatsUp: null,
    trunkLitersSeatsFolded: null,
    fuelTankLiters: 40,
    adaptiveCruise: true,
    adaptiveCruiseStopGo: true,
    blindSpotMonitor: true,
    hillHold: true,
    steeringAid: true,
    foldingMirrors: true,
    upgradedRims: true,
    appleCarPlay: true,
    androidAuto: true,
    parkingSensorsRear: true,
    radarEmergencyBraking: true,
    highwayLPer100km: 5.0,
    combinedLPer100km: 5.5,
  }),
  mockCar("mock-sandero-stam", {
    brand: "Dacia",
    model: "Sandero",
    trim: "TCe 90 Comfort",
    year: 2021,
    priceCents: 1_279_000,
    listingUrl: "https://example.com/sandero-stam",
    odometerKm: 25_794,
    fuelType: "petrol",
    transmission: "manual",
    gears: 6,
    horsepower: 90,
    torqueNm: null,
    cylinders: 3,
    licensePlate: null,
    apkValidUntil: null,
    sellerName: "Stam",
    sellerCity: "Alphen aan den Rijn",
    sellerAddress: "Handelsweg 12, 2404 CD Alphen aan den Rijn",
    trunkWidthMm: null,
    trunkHeightMm: null,
    trunkLitersSeatsUp: 328,
    trunkLitersSeatsFolded: 1108,
    fuelTankLiters: 50,
    cruiseControl: true,
    hillHold: true,
    appleCarPlay: false,
    androidAuto: false,
    highwayLPer100km: null,
    combinedLPer100km: 5.3,
  }),
  mockCar("mock-sandero-autoscout", {
    brand: "Dacia",
    model: "Sandero",
    trim: "1.0 TCe 90 Comfort",
    year: 2021,
    priceCents: 1_295_000,
    listingUrl: "https://example.com/sandero-autoscout",
    odometerKm: 44_030,
    fuelType: "petrol",
    transmission: "manual",
    gears: 6,
    horsepower: 92,
    torqueNm: 160,
    cylinders: 3,
    licensePlate: "N-426-NR",
    apkValidUntil: "2027-12-01",
    sellerName: "De Automakelaar",
    sellerCity: "Harderwijk",
    sellerAddress: "Edisonstraat 9, 3846 AS Harderwijk",
    trunkWidthMm: null,
    trunkHeightMm: null,
    trunkLitersSeatsUp: null,
    trunkLitersSeatsFolded: null,
    fuelTankLiters: 50,
    rearviewCamera: true,
    radarEmergencyBraking: true,
    blindSpotMonitor: true,
    hillHold: true,
    cruiseControl: true,
    parkingSensorsRear: true,
    highwayLPer100km: 5.4,
    combinedLPer100km: 5.6,
  }),
];

function sortValue(car: Car, sort: NonNullable<CarsQuery["sort"]>): number | null {
  switch (sort) {
    case "price":
      return car.priceCents;
    case "odometer":
      return car.odometerKm;
    case "year":
      return car.year;
    case "horsepower":
      return car.horsepower;
    case "consumption":
      return car.highwayLPer100km;
  }
}

export function filterAndSortCars(cars: Car[], query: CarsQuery): Car[] {
  const filtered = filterCars(cars, query);

  const sort = query.sort ?? "price";
  const dir = query.sortDir ?? "asc";
  const sign = dir === "desc" ? -1 : 1;

  return [...filtered].sort((a, b) => {
    const av = sortValue(a, sort);
    const bv = sortValue(b, sort);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av === bv) return 0;
    return av < bv ? -sign : sign;
  });
}
