import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { carCreateSchema } from "../src/lib/car-schema";
import { DATA_DIR, UPLOADS_DIR, ensureDataDirs, getDb, schema } from "../src/lib/db";
import { seedListings } from "./seed-data";

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
};

const PLACEHOLDER = path.join(process.cwd(), "scripts", "placeholder-car.svg");

function extFor(url: string, mime: string | null): string {
  if (mime?.includes("png")) return ".png";
  if (mime?.includes("webp")) return ".webp";
  if (mime?.includes("svg")) return ".svg";
  if (mime?.includes("jpeg") || mime?.includes("jpg")) return ".jpg";
  const clean = url.split("?")[0] ?? url;
  if (clean.endsWith(".webp")) return ".webp";
  if (clean.endsWith(".png")) return ".png";
  if (clean.endsWith(".svg")) return ".svg";
  return ".jpg";
}

async function downloadImage(
  url: string,
  destWithoutExt: string,
): Promise<{ absPath: string; mimeType: string; originalName: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(url, {
      headers: FETCH_HEADERS,
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const mime = res.headers.get("content-type")?.split(";")[0] ?? null;
    if (mime && !mime.startsWith("image/")) {
      throw new Error(`not an image: ${mime}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 64) throw new Error("empty body");
    const ext = extFor(url, mime);
    const absPath = `${destWithoutExt}${ext}`;
    writeFileSync(absPath, buf);
    const originalName = path.basename(url.split("?")[0] ?? url) || `image${ext}`;
    return {
      absPath,
      mimeType: mime ?? (ext === ".webp" ? "image/webp" : "image/jpeg"),
      originalName,
    };
  } finally {
    clearTimeout(timer);
  }
}

function writePlaceholder(destDir: string, index: number) {
  const absPath = path.join(destDir, `${String(index).padStart(2, "0")}-placeholder.svg`);
  copyFileSync(PLACEHOLDER, absPath);
  return {
    absPath,
    mimeType: "image/svg+xml",
    originalName: "placeholder-car.svg",
  };
}

function volumePath(absPath: string): string {
  const rel = path.relative(DATA_DIR, absPath).replaceAll("\\", "/");
  return rel.startsWith("uploads/") ? rel : `uploads/${rel}`;
}

async function main() {
  ensureDataDirs();
  const db = getDb();
  const now = new Date().toISOString();

  for (const listing of seedListings) {
    const car = carCreateSchema.parse(listing.car);
    const carDir = path.join(UPLOADS_DIR, listing.id);
    mkdirSync(carDir, { recursive: true });

    await db.delete(schema.carImages).where(eq(schema.carImages.carId, listing.id));
    await db.delete(schema.cars).where(eq(schema.cars.id, listing.id));

    await db.insert(schema.cars).values({
      id: listing.id,
      ...car,
      createdAt: now,
      updatedAt: now,
    });

    const urls = listing.imageUrls.length > 0 ? listing.imageUrls : [null];
    let sort = 0;
    for (const url of urls) {
      const destBase = path.join(carDir, String(sort).padStart(2, "0"));
      let file: {
        absPath: string;
        mimeType: string;
        originalName: string;
      };
      if (url) {
        try {
          file = await downloadImage(url, destBase);
          console.log(`ok  ${listing.id} [${sort}] ${url}`);
        } catch (err) {
          const reason = err instanceof Error ? err.message : String(err);
          console.warn(`placeholder ${listing.id} [${sort}] ${reason}`);
          file = writePlaceholder(carDir, sort);
        }
      } else {
        console.warn(`placeholder ${listing.id} [${sort}] no listing photo URL`);
        file = writePlaceholder(carDir, sort);
      }

      await db.insert(schema.carImages).values({
        id: `${listing.id}-img-${sort}`,
        carId: listing.id,
        path: volumePath(file.absPath),
        sortOrder: sort,
        mimeType: file.mimeType,
        originalName: file.originalName,
      });
      sort += 1;
    }
  }

  console.log(`Seeded ${seedListings.length} cars into ${path.join(DATA_DIR, "carcompare.db")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
