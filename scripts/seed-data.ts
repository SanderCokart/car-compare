/**
 * Six live occasion listings (fetched 2026-08-23).
 *
 * Listing text wins for this car's options. Model-typical specs below were
 * filled only from cited sources (max 3 lookups per gap, then left null).
 * Not filled from generic pages: APK, plate, odometer, price, seller.
 *
 * Trunk / tank sources:
 * - Polo AW 1.0 MPI Trendline: Autoweek testdata
 *   https://www.autoweek.nl/auto/92193/volkswagen-polo-1-0-65pk-trendline/
 *   tank 40 L, trunk 351 L; folded 1125 L from Auto-Wiki Polo AW Trendline
 *   https://www.auto-wiki.org/vw/polo/aw/polo-1-0-mpi-trendline-59-kw-93452/
 * - Polo 1.0 TSI 95 Comfortline Business (2018–2021): Autoweek
 *   https://www.autoweek.nl/auto/93590/volkswagen-polo-1-0-tsi-95pk-comfortline-business/
 *   175 Nm, tank 40 L, trunk 351 L, extra-urban 3.8 L/100 km
 * - Polo 1.0 TSI 95 Life: Autoweek
 *   https://www.autoweek.nl/auto/103978/volkswagen-polo-1-0-tsi-95pk-life/
 *   175 Nm, tank 40 L; VW still quotes 351/1125 L for this generation
 *   (Autoweek Life testdata lists 355 L seats-up — not used; factory 351)
 * - Polo trunk width/height mm: Autoweek n.b.; no brochure mm after 3 tries
 * - Sandero TCe 90 Comfort: Autoweek
 *   https://www.autoweek.nl/auto/102317/dacia-sandero-tce-90-comfort/
 *   160 Nm, tank 50 L, trunk 328 L VDA; extra-urban 4.3 / combined 5.0
 * - Sandero folded 1108 L VDA + inner width 1026 mm:
 *   https://www.dacia.nl/modellen/sandero/afmetingen.html
 *   Dacia dimensions sheet (boot entry 1021 mm, between arches 1026 mm)
 * - Sandero trunk height mm: not published (sill-to-ground is not height)
 */
import { FEATURE_KEYS, type CarCreate, type FeatureKey } from "../src/lib/car-schema";

export type SeedListing = {
  id: string;
  car: CarCreate;
  imageUrls: string[];
};

function features(
  known: Partial<Record<FeatureKey, boolean>>,
): Record<FeatureKey, boolean | null> {
  const out = Object.fromEntries(FEATURE_KEYS.map((k) => [k, null])) as Record<
    FeatureKey,
    boolean | null
  >;
  for (const [k, v] of Object.entries(known) as [FeatureKey, boolean][]) {
    out[k] = v;
  }
  return out;
}

/** Polo VI (AW), factory VDA. Width/height unpublished. */
const poloAwTrunk = {
  trunkWidthMm: null,
  trunkHeightMm: null,
  trunkLitersSeatsUp: 351,
  trunkLitersSeatsFolded: 1125,
} as const;

/** Sandero III petrol hatch (not Stepway). Height unpublished. */
const sanderoTrunk = {
  trunkWidthMm: 1026,
  trunkHeightMm: null,
  trunkLitersSeatsUp: 328,
  trunkLitersSeatsFolded: 1108,
} as const;

export const seedListings: SeedListing[] = [
  {
    id: "korteland-polo-7306087",
    // Korteland's own host returns 403 to automated clients. These 11 photos
    // are the same listing (HVR-40-Z, Korteland Auto's) syndicated on AutoTrack.
    imageUrls: [
      "https://cdn.autotrack.nl/57759357/0-b0b3b7da0acd29c114cf7a478755b51e.jpg?h=675&w=900",
      "https://cdn.autotrack.nl/57759357/0-a918910e373f1126861f3c1f875a9041.jpg?h=675&w=900",
      "https://cdn.autotrack.nl/57759357/0-bed431cfe8a70758af86e66cd53e19dc.jpg?h=675&w=900",
      "https://cdn.autotrack.nl/57759357/0-c556eb9079f9ef96a5cb448858163ca4.jpg?h=675&w=900",
      "https://cdn.autotrack.nl/57759357/0-bec7ca789270b9e989f48053fa0ec10d.jpg?h=675&w=900",
      "https://cdn.autotrack.nl/57759357/0-943e5885c5c2c2fc19ed7205f9a3e221.jpg?h=675&w=900",
      "https://cdn.autotrack.nl/57759357/0-edf0c79ddd63fb075d37a4c52fe04fad.jpg?h=675&w=900",
      "https://cdn.autotrack.nl/57759357/0-32fd0be63e00e0ad13ac3afab1935944.jpg?h=675&w=900",
      "https://cdn.autotrack.nl/57759357/0-a6d62256a0770702fc8b6b7c79ad5390.jpg?h=675&w=900",
      "https://cdn.autotrack.nl/57759357/0-25738a0381a15320c14c88880c0d5450.jpg?h=675&w=900",
      "https://cdn.autotrack.nl/57759357/0-a059e2a2182c8afec78c5dea56067993.jpg?h=675&w=900",
    ],
    car: {
      brand: "Volkswagen",
      model: "Polo",
      trim: "1.0 MPI Trendline",
      year: 2018,
      priceCents: 1_095_000,
      listingUrl:
        "https://kortelandautos.nl/occasions/volkswagen/polo/7306087",
      odometerKm: 84936,
      fuelType: "petrol",
      transmission: "manual",
      gears: 5,
      horsepower: 65,
      torqueNm: 95,
      cylinders: 3,
      licensePlate: "HVR-40-Z",
      apkValidUntil: "2026-11-07",
      sellerName: "Korteland Auto's",
      sellerCity: "Rijswijk",
      sellerAddress: "Oranjelaan 42, Rijswijk",
      ...poloAwTrunk,
      fuelTankLiters: 40,
      ...features({
        appleCarPlay: true,
        androidAuto: true,
        radarEmergencyBraking: true,
        hillHold: true,
        cruiseControl: true,
      }),
      highwayLPer100km: 4.1,
      combinedLPer100km: 4.7,
    },
  },
  {
    id: "autotrack-polo-59442340",
    imageUrls: [
      "https://cdn.autotrack.nl/59442340/0-e0318b371886f82afd7df0b168e51c78.jpg?h=675&w=900",
      "https://cdn.autotrack.nl/59442340/0-ea2e2b567374752fbf24c24a956d4043.jpg?h=675&w=900",
      "https://cdn.autotrack.nl/59442340/0-30c004b19936c72a70517d0e27e01a51.jpg?h=675&w=900",
      "https://cdn.autotrack.nl/59442340/0-0326f878d03c94604ff82d1579b7c9ad.jpg?h=675&w=900",
      "https://cdn.autotrack.nl/59442340/0-a5d69594dcbc054d5e0cd86d1eaba2c4.jpg?h=675&w=900",
      "https://cdn.autotrack.nl/59442340/0-be6214c7a26035b91e6f8bf4a1f4f536.jpg?h=675&w=900",
    ],
    car: {
      brand: "Volkswagen",
      model: "Polo",
      trim: "1.0 TSI Comfortline Business",
      year: 2019,
      priceCents: 1_295_000,
      listingUrl:
        "https://www.autotrack.nl/a/volkswagen-polo-benzine-2019-59442340",
      odometerKm: 69575,
      fuelType: "petrol",
      transmission: "manual",
      gears: 5,
      horsepower: 97,
      torqueNm: 175,
      cylinders: 3,
      licensePlate: "K-605-XX",
      apkValidUntil: "2027-08-04",
      sellerName: "Auto-Ypenburg B.V.",
      sellerCity: "'s-Gravenhage",
      sellerAddress: "Mercuriusweg 20, 2516 AW 's-Gravenhage",
      ...poloAwTrunk,
      fuelTankLiters: 40,
      ...features({
        parkingSensorsFront: true,
        parkingSensorsRear: true,
        radarEmergencyBraking: true,
        upgradedRims: true,
        adaptiveCruise: true,
        hillHold: true,
        cruiseControl: true,
      }),
      highwayLPer100km: 3.8,
      combinedLPer100km: 100 / 18.5,
    },
  },
  {
    id: "motorhuis-polo-323783018",
    imageUrls: [
      "https://image-storage.powerkraut.nl/storage/media/323783018/1.jpg?hash=82fef11c",
      "https://image-storage.powerkraut.nl/storage/media/323783018/2.jpg?hash=82fef11c",
      "https://image-storage.powerkraut.nl/storage/media/323783018/3.jpg?hash=82fef11c",
      "https://image-storage.powerkraut.nl/storage/media/323783018/4.jpg?hash=82fef11c",
      "https://image-storage.powerkraut.nl/storage/media/323783018/5.jpg?hash=82fef11c",
      "https://image-storage.powerkraut.nl/storage/media/323783018/6.jpg?hash=82fef11c",
    ],
    car: {
      brand: "Volkswagen",
      model: "Polo",
      trim: "1.0 TSI Comfortline Business",
      year: 2021,
      priceCents: 1_344_500,
      listingUrl:
        "https://www.motorhuis.nl/voorraad/volkswagen/polo/1-0-tsi-comfortline-business-323783018/",
      odometerKm: 123722,
      fuelType: "petrol",
      transmission: "manual",
      gears: 5,
      horsepower: 95,
      torqueNm: 175,
      cylinders: 3,
      licensePlate: "L-294-ZT",
      apkValidUntil: null,
      sellerName: "Motorhuis Den Haag Binckhorstlaan",
      sellerCity: "Den Haag",
      sellerAddress: "Binckhorstlaan 125, 2516 BA Den Haag",
      ...poloAwTrunk,
      fuelTankLiters: 40,
      ...features({
        parkingSensorsFront: true,
        parkingSensorsRear: true,
        androidAuto: true,
        appleCarPlay: true,
        rearviewCamera: true,
        radarEmergencyBraking: true,
        upgradedRims: true,
        adaptiveCruise: true,
        hillHold: true,
        cruiseControl: true,
      }),
      highwayLPer100km: 3.8,
      combinedLPer100km: 5.4,
    },
  },
  {
    id: "autowereld-polo-43540640",
    imageUrls: [
      "https://cdn.autowereld.nl/I770291431/1280x0/volkswagen-polo-1-0-tsi-life-addcruise-laneass-nap-carplay.jpg",
      "https://cdn.autowereld.nl/I770291433/1280x0/volkswagen-polo-1-0-tsi-life-addcruise-laneass-nap-carplay.jpg",
      "https://cdn.autowereld.nl/I770291436/1280x0/volkswagen-polo-1-0-tsi-life-addcruise-laneass-nap-carplay.jpg",
      "https://cdn.autowereld.nl/I770291439/1280x0/volkswagen-polo-1-0-tsi-life-addcruise-laneass-nap-carplay.jpg",
      "https://cdn.autowereld.nl/I770291442/1280x0/volkswagen-polo-1-0-tsi-life-addcruise-laneass-nap-carplay.jpg",
      "https://cdn.autowereld.nl/I770291444/1280x0/volkswagen-polo-1-0-tsi-life-addcruise-laneass-nap-carplay.jpg",
    ],
    car: {
      brand: "Volkswagen",
      model: "Polo",
      trim: "1.0 TSI Life ADDCRUISE LANEASS NAP CARPLAY",
      year: 2022,
      priceCents: 1_399_900,
      listingUrl:
        "https://www.autowereld.nl/volkswagen/polo/1-0-tsi-life-addcruise-laneass-nap-carplay-43540640/details.html",
      odometerKm: 112923,
      fuelType: "petrol",
      transmission: "manual",
      gears: 5,
      horsepower: 95,
      torqueNm: 175,
      cylinders: 3,
      licensePlate: "P-529-SR",
      apkValidUntil: "2028-04-08",
      sellerName: "Neologistics",
      sellerCity: "'s-Gravenhage",
      sellerAddress: "Groenewegje 154, 2515 NC 's-Gravenhage",
      ...poloAwTrunk,
      fuelTankLiters: 40,
      ...features({
        blindSpotMonitor: true,
        androidAuto: true,
        appleCarPlay: true,
        radarEmergencyBraking: true,
        upgradedRims: true,
        adaptiveCruise: true,
        adaptiveCruiseStopGo: true,
        steeringAid: true,
        hillHold: true,
        cruiseControl: true,
        foldingMirrors: true,
      }),
      highwayLPer100km: 4,
      combinedLPer100km: 4.6,
    },
  },
  {
    id: "stam-sandero-375212795",
    imageUrls: [
      "https://image-storage.powerkraut.nl/storage/media/375212795/1.jpg?hash=86f832d6",
      "https://image-storage.powerkraut.nl/storage/media/375212795/2.jpg?hash=86f832d6",
      "https://image-storage.powerkraut.nl/storage/media/375212795/3.jpg?hash=86f832d6",
      "https://image-storage.powerkraut.nl/storage/media/375212795/4.jpg?hash=86f832d6",
      "https://image-storage.powerkraut.nl/storage/media/375212795/5.jpg?hash=86f832d6",
      "https://image-storage.powerkraut.nl/storage/media/375212795/6.jpg?hash=86f832d6",
    ],
    car: {
      brand: "Dacia",
      model: "Sandero",
      trim: "90pk TCe Comfort",
      year: 2021,
      priceCents: 1_279_000,
      listingUrl:
        "https://www.stam.nl/voorraad/dacia/sandero/90pk-tce-comfort-375212795/",
      odometerKm: 25794,
      fuelType: "petrol",
      transmission: "manual",
      gears: 6,
      horsepower: 92,
      torqueNm: 160,
      cylinders: 3,
      licensePlate: "N-927-GJ",
      apkValidUntil: null,
      sellerName: "Stam Amersfoort",
      sellerCity: "Amersfoort",
      sellerAddress: "Gemini 1, 3824 MH Amersfoort",
      ...sanderoTrunk,
      fuelTankLiters: 50,
      ...features({
        blindSpotMonitor: true,
        parkingSensorsFront: true,
        parkingSensorsRear: true,
        androidAuto: true,
        appleCarPlay: true,
        rearviewCamera: true,
        radarEmergencyBraking: true,
        hillHold: true,
        cruiseControl: true,
      }),
      highwayLPer100km: 4.1,
      combinedLPer100km: 4.8,
    },
  },
  {
    id: "autoscout-sandero-fe73c27e",
    imageUrls: [
      "https://prod.pictures.autoscout24.net/listing-images/fe73c27e-2e9a-416e-b800-67f475676911_98fc425b-223c-48ed-8f18-b700959edb46.jpg/1280x960.webp",
      "https://prod.pictures.autoscout24.net/listing-images/fe73c27e-2e9a-416e-b800-67f475676911_3c65b380-24d2-4461-a315-77171e8ff45a.jpg/1280x960.webp",
      "https://prod.pictures.autoscout24.net/listing-images/fe73c27e-2e9a-416e-b800-67f475676911_3e806552-2bf7-4a0e-b4fe-bc31dd3a7c0d.jpg/1280x960.webp",
      "https://prod.pictures.autoscout24.net/listing-images/fe73c27e-2e9a-416e-b800-67f475676911_dc5d69e4-12b2-4681-a9fa-2c872ce08627.jpg/1280x960.webp",
      "https://prod.pictures.autoscout24.net/listing-images/fe73c27e-2e9a-416e-b800-67f475676911_4f5df2ee-d3d8-4622-9b72-36c10f8cfa96.jpg/1280x960.webp",
      "https://prod.pictures.autoscout24.net/listing-images/fe73c27e-2e9a-416e-b800-67f475676911_9d1503d2-88b7-4c7b-bc9c-29a28615a7ca.jpg/1280x960.webp",
    ],
    car: {
      brand: "Dacia",
      model: "Sandero",
      trim: "1.0 TCe 90 Comfort",
      year: 2021,
      priceCents: 1_295_000,
      listingUrl:
        "https://www.autoscout24.nl/aanbod/dacia-sandero-1-0-tce-90-comfort-2e-eigenaar-3-6-12-mnd-garan-benzine-rood-cat_ma16360mo19129-fe73c27e-2e9a-416e-b800-67f475676911",
      odometerKm: 44030,
      fuelType: "petrol",
      transmission: "manual",
      gears: 6,
      horsepower: 92,
      torqueNm: 160,
      cylinders: 3,
      licensePlate: "N-426-NR",
      apkValidUntil: "2027-12-01",
      sellerName: "De Automakelaar Harderwijk B.V.",
      sellerCity: "Harderwijk",
      sellerAddress: "Edisonstraat 9, 3846 AS Harderwijk",
      ...sanderoTrunk,
      fuelTankLiters: 50,
      ...features({
        blindSpotMonitor: true,
        appleCarPlay: true,
        rearviewCamera: true,
        radarEmergencyBraking: true,
        hillHold: true,
        cruiseControl: true,
      }),
      highwayLPer100km: 4.3,
      combinedLPer100km: 5.0,
    },
  },
];
