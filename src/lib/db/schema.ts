import { relations } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const bool = (name: string) => integer(name, { mode: "boolean" });
const int = (name: string) => integer(name, { mode: "number" });

/**
 * SQLite tables matching `src/lib/car-schema.ts`.
 * Booleans are stored as 0/1. DB file: `data/carcompare.db`.
 */
export const cars = sqliteTable("cars", {
  id: text("id").primaryKey(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  trim: text("trim"),
  year: int("year"),
  priceCents: int("price_cents").notNull(),
  listingUrl: text("listing_url"),

  odometerKm: int("odometer_km"),
  fuelType: text("fuel_type"),
  transmission: text("transmission"),
  gears: int("gears"),
  horsepower: int("horsepower"),
  torqueNm: int("torque_nm"),
  cylinders: int("cylinders"),
  licensePlate: text("license_plate"),
  apkValidUntil: text("apk_valid_until"),

  sellerName: text("seller_name"),
  sellerCity: text("seller_city"),
  sellerAddress: text("seller_address"),

  trunkWidthMm: int("trunk_width_mm"),
  trunkHeightMm: int("trunk_height_mm"),
  trunkLitersSeatsUp: int("trunk_liters_seats_up"),
  trunkLitersSeatsFolded: int("trunk_liters_seats_folded"),
  fuelTankLiters: real("fuel_tank_liters"),

  blindSpotMonitor: bool("blind_spot_monitor"),
  parkingSensorsFront: bool("parking_sensors_front"),
  parkingSensorsRear: bool("parking_sensors_rear"),
  androidAuto: bool("android_auto"),
  appleCarPlay: bool("apple_car_play"),
  rearviewCamera: bool("rearview_camera"),
  radarEmergencyBraking: bool("radar_emergency_braking"),
  upgradedRims: bool("upgraded_rims"),
  adaptiveCruise: bool("adaptive_cruise"),
  adaptiveCruiseStopGo: bool("adaptive_cruise_stop_go"),
  steeringAid: bool("steering_aid"),
  hillHold: bool("hill_hold"),
  cruiseControl: bool("cruise_control"),
  speedLimiter: bool("speed_limiter"),
  foldingMirrors: bool("folding_mirrors"),

  highwayLPer100km: real("highway_l_per_100km"),
  combinedLPer100km: real("combined_l_per_100km"),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const carImages = sqliteTable(
  "car_images",
  {
    id: text("id").primaryKey(),
    carId: text("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    path: text("path").notNull(),
    sortOrder: int("sort_order").notNull(),
    mimeType: text("mime_type"),
    originalName: text("original_name"),
  },
  (t) => [index("car_images_car_id_idx").on(t.carId)],
);

export const carsRelations = relations(cars, ({ many }) => ({
  images: many(carImages),
}));

export const carImagesRelations = relations(carImages, ({ one }) => ({
  car: one(cars, { fields: [carImages.carId], references: [cars.id] }),
}));

export type CarRow = typeof cars.$inferSelect;
export type NewCarRow = typeof cars.$inferInsert;
export type CarImageRow = typeof carImages.$inferSelect;
export type NewCarImageRow = typeof carImages.$inferInsert;
