import { and, asc, desc, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import {
  carCreateSchema,
  carFieldsSchema,
  carsQuerySchema,
  carUpdateSchema,
  FEATURE_KEYS,
  type CarCreate,
  type CarRecord,
  type CarsQuery,
  type CarUpdate,
  type RosterFacets,
} from "@/lib/car-schema";
import { facetsFromCars } from "@/lib/cars-query";
import { getDb } from "@/lib/db";
import { carImages, cars, type CarImageRow, type CarRow } from "@/lib/db/schema";
import { deleteCarUploadDir, unlinkUploadIfExists } from "@/lib/uploads";

const SORT_COLUMNS = {
  price: cars.priceCents,
  odometer: cars.odometerKm,
  year: cars.year,
  horsepower: cars.horsepower,
  consumption: cars.highwayLPer100km,
} as const;

export function nowIso() {
  return new Date().toISOString();
}

export function newId() {
  return crypto.randomUUID();
}

function fillCreateDefaults(body: unknown): unknown {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body;
  const filled: Record<string, unknown> = { ...(body as Record<string, unknown>) };
  for (const key of Object.keys(carFieldsSchema.shape)) {
    if (key === "brand" || key === "model" || key === "priceCents") continue;
    if (!(key in filled)) filled[key] = null;
  }
  return filled;
}

export function parseCarCreate(body: unknown) {
  return carCreateSchema.safeParse(fillCreateDefaults(body));
}

export function parseCarUpdate(body: unknown) {
  return carUpdateSchema.safeParse(body);
}

export function parseCarsQuery(searchParams: URLSearchParams) {
  const raw: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    if (value !== "") raw[key] = value;
  }
  const parsed: Record<string, string | boolean> = { ...raw };
  for (const key of FEATURE_KEYS) {
    const value = raw[key];
    if (value == null) continue;
    if (value === "true" || value === "1") parsed[key] = true;
    else if (value === "false" || value === "0") parsed[key] = false;
  }
  return carsQuerySchema.safeParse(parsed);
}

function toCarRecord(row: CarRow, images: CarImageRow[]): CarRecord {
  return {
    ...row,
    fuelType: row.fuelType as CarRecord["fuelType"],
    transmission: row.transmission as CarRecord["transmission"],
    images: images.map((image) => ({
      id: image.id,
      carId: image.carId,
      path: image.path,
      sortOrder: image.sortOrder,
      mimeType: image.mimeType,
      originalName: image.originalName,
    })),
  };
}

async function imagesForCar(carId: string): Promise<CarImageRow[]> {
  const db = getDb();
  return db
    .select()
    .from(carImages)
    .where(eq(carImages.carId, carId))
    .orderBy(asc(carImages.sortOrder), asc(carImages.id));
}

export async function getCarById(id: string): Promise<CarRecord | null> {
  const db = getDb();
  const [row] = await db.select().from(cars).where(eq(cars.id, id)).limit(1);
  if (!row) return null;
  return toCarRecord(row, await imagesForCar(id));
}

function listFilters(query: CarsQuery): SQL | undefined {
  const parts: SQL[] = [];

  if (query.brand) {
    parts.push(sql`lower(${cars.brand}) = ${query.brand.toLowerCase()}`);
  }
  if (query.fuel) parts.push(eq(cars.fuelType, query.fuel));
  if (query.transmission) parts.push(eq(cars.transmission, query.transmission));
  if (query.minPriceCents != null) parts.push(gte(cars.priceCents, query.minPriceCents));
  if (query.maxPriceCents != null) parts.push(lte(cars.priceCents, query.maxPriceCents));
  if (query.minOdometerKm != null) parts.push(gte(cars.odometerKm, query.minOdometerKm));
  if (query.maxOdometerKm != null) parts.push(lte(cars.odometerKm, query.maxOdometerKm));

  for (const key of FEATURE_KEYS) {
    const value = query[key];
    if (value == null) continue;
    parts.push(eq(cars[key], value));
  }

  return parts.length ? and(...parts) : undefined;
}

export async function listCars(query: CarsQuery): Promise<CarRecord[]> {
  const db = getDb();
  const sortKey = query.sort ?? "price";
  const direction = query.sortDir ?? "asc";
  const column = SORT_COLUMNS[sortKey];
  const order = direction === "desc" ? desc(column) : asc(column);
  const where = listFilters(query);

  const rows = await db
    .select()
    .from(cars)
    .where(where)
    .orderBy(sql`${column} is null`, order, asc(cars.id));

  if (rows.length === 0) return [];

  const images = await db
    .select()
    .from(carImages)
    .orderBy(asc(carImages.sortOrder), asc(carImages.id));
  const imagesByCar = new Map<string, CarImageRow[]>();
  for (const image of images) {
    const list = imagesByCar.get(image.carId) ?? [];
    list.push(image);
    imagesByCar.set(image.carId, list);
  }

  return rows.map((row) => toCarRecord(row, imagesByCar.get(row.id) ?? []));
}

/** Distinct brand / fuel / transmission values from every car, ignoring active filters. */
export async function listCarFacets(): Promise<RosterFacets> {
  const db = getDb();
  const rows = await db
    .select({
      brand: cars.brand,
      fuelType: cars.fuelType,
      transmission: cars.transmission,
    })
    .from(cars);
  return facetsFromCars(rows);
}

export async function createCar(input: CarCreate): Promise<CarRecord> {
  const db = getDb();
  const id = newId();
  const now = nowIso();
  await db.insert(cars).values({ id, ...input, createdAt: now, updatedAt: now });
  const created = await getCarById(id);
  if (!created) throw new Error("Failed to load created car");
  return created;
}

export async function updateCar(id: string, input: CarUpdate): Promise<CarRecord | null> {
  const existing = await getCarById(id);
  if (!existing) return null;
  if (Object.keys(input).length === 0) return existing;

  const db = getDb();
  await db
    .update(cars)
    .set({ ...input, updatedAt: nowIso() })
    .where(eq(cars.id, id));
  return getCarById(id);
}

export async function deleteCar(id: string): Promise<boolean> {
  const existing = await getCarById(id);
  if (!existing) return false;

  const db = getDb();
  await db.delete(cars).where(eq(cars.id, id));
  deleteCarUploadDir(id);
  return true;
}

export async function nextImageSortOrder(carId: string): Promise<number> {
  const existing = await imagesForCar(carId);
  if (existing.length === 0) return 0;
  return Math.max(...existing.map((image) => image.sortOrder)) + 1;
}

export async function addCarImages(
  carId: string,
  files: Array<{
    relativePath: string;
    mimeType: string;
    originalName: string;
  }>,
): Promise<CarRecord | null> {
  const existing = await getCarById(carId);
  if (!existing) return null;

  const db = getDb();
  let sortOrder = await nextImageSortOrder(carId);
  for (const file of files) {
    await db.insert(carImages).values({
      id: newId(),
      carId,
      path: file.relativePath,
      sortOrder,
      mimeType: file.mimeType,
      originalName: file.originalName,
    });
    sortOrder += 1;
  }

  await db.update(cars).set({ updatedAt: nowIso() }).where(eq(cars.id, carId));
  return getCarById(carId);
}

export async function deleteCarImage(carId: string, imageId: string): Promise<"missing-car" | "missing-image" | "ok"> {
  const car = await getCarById(carId);
  if (!car) return "missing-car";

  const db = getDb();
  const [image] = await db
    .select()
    .from(carImages)
    .where(and(eq(carImages.id, imageId), eq(carImages.carId, carId)))
    .limit(1);
  if (!image) return "missing-image";

  await db.delete(carImages).where(eq(carImages.id, imageId));
  unlinkUploadIfExists(image.path);
  await db.update(cars).set({ updatedAt: nowIso() }).where(eq(cars.id, carId));
  return "ok";
}
