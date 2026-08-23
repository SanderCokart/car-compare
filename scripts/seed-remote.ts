/**
 * POST seed listings + photos to a running Car Compare API (e.g. production).
 *
 *   npx tsx scripts/seed-remote.ts
 *   SEED_API_BASE=https://cc.sandercokart.com npx tsx scripts/seed-remote.ts
 *
 * Re-runs are idempotent by listingUrl. Incomplete galleries are replaced.
 */
import { seedListings } from "./seed-data";

const BASE = (process.env.SEED_API_BASE ?? "https://cc.sandercokart.com").replace(/\/$/, "");

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "image/jpeg,image/jpg,image/png,image/webp;q=0.9,*/*;q=0.1",
};

type ExistingImage = { id: string };
type ExistingCar = {
  id: string;
  listingUrl?: string | null;
  images?: ExistingImage[];
};

function mimeFromMagic(bytes: Uint8Array): { mime: string; ext: string } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return { mime: "image/png", ext: "png" };
  }
  if (bytes.length >= 12) {
    const head = String.fromCharCode(...bytes.slice(0, 4));
    const fourcc = String.fromCharCode(...bytes.slice(8, 12));
    if (head === "RIFF" && fourcc === "WEBP") return { mime: "image/webp", ext: "webp" };
  }
  return null;
}

async function downloadImage(url: string): Promise<{ bytes: Uint8Array; mime: string; name: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(url, {
      headers: FETCH_HEADERS,
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) {
      console.warn(`  skip image HTTP ${res.status} ${url}`);
      return null;
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    const detected = mimeFromMagic(bytes);
    if (!detected) {
      console.warn(`  skip image (not jpeg/png/webp) ${url}`);
      return null;
    }
    return { bytes, mime: detected.mime, name: `photo.${detected.ext}` };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`  skip image ${reason} ${url}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function uploadPhotos(carId: string, files: { bytes: Uint8Array; mime: string; name: string }[]) {
  if (files.length === 0) {
    console.warn(`  no photos uploaded for ${carId}`);
    return;
  }
  const form = new FormData();
  for (const file of files) {
    form.append("files", new Blob([file.bytes], { type: file.mime }), file.name);
  }
  const imgRes = await fetch(`${BASE}/api/cars/${carId}/images`, {
    method: "POST",
    body: form,
  });
  if (!imgRes.ok) {
    throw new Error(`images ${carId} failed: ${imgRes.status} ${await imgRes.text()}`);
  }
  console.log(`  uploaded ${files.length} photos`);
}

async function replaceGallery(car: ExistingCar, imageUrls: string[]) {
  for (const image of car.images ?? []) {
    const res = await fetch(`${BASE}/api/cars/${car.id}/images/${image.id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 404) {
      throw new Error(`DELETE image ${image.id} failed: ${res.status} ${await res.text()}`);
    }
  }
  const files: { bytes: Uint8Array; mime: string; name: string }[] = [];
  for (const imageUrl of imageUrls) {
    const file = await downloadImage(imageUrl);
    if (file) files.push(file);
  }
  await uploadPhotos(car.id, files);
}

async function main() {
  console.log(`Seeding ${seedListings.length} cars to ${BASE}`);

  const listRes = await fetch(`${BASE}/api/cars`);
  if (!listRes.ok) {
    throw new Error(`GET /api/cars failed: ${listRes.status} ${await listRes.text()}`);
  }
  const existing = (await listRes.json()) as ExistingCar[];
  const byListingUrl = new Map(
    existing
      .filter((c) => typeof c.listingUrl === "string" && c.listingUrl.length > 0)
      .map((c) => [c.listingUrl as string, c]),
  );

  for (const listing of seedListings) {
    const url = listing.car.listingUrl;
    const already = url ? byListingUrl.get(url) : undefined;

    if (already) {
      const have = already.images?.length ?? 0;
      if (have >= listing.imageUrls.length) {
        console.log(`skip ${listing.id} (already on roster with ${have} photos)`);
        continue;
      }
      console.log(`replace gallery ${listing.id} -> ${already.id} (had ${have})`);
      await replaceGallery(already, listing.imageUrls);
      continue;
    }

    const createRes = await fetch(`${BASE}/api/cars`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(listing.car),
    });
    if (!createRes.ok) {
      throw new Error(`POST ${listing.id} failed: ${createRes.status} ${await createRes.text()}`);
    }
    const created = (await createRes.json()) as { id: string };
    console.log(`created ${listing.id} -> ${created.id}`);

    const files: { bytes: Uint8Array; mime: string; name: string }[] = [];
    for (const imageUrl of listing.imageUrls) {
      const file = await downloadImage(imageUrl);
      if (file) files.push(file);
    }
    await uploadPhotos(created.id, files);
  }

  const after = await fetch(`${BASE}/api/cars`);
  const roster = (await after.json()) as ExistingCar[];
  console.log(
    `Done. Roster size: ${roster.length}. Photos: ${roster.map((c) => c.images?.length ?? 0).join(",")}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
