This is a Next.js 16 car comparison helper. SQLite lives at `data/carcompare.db`; listing photos are stored under `data/uploads` and served from `/uploads/...`.

## Getting started

```bash
npm install
npm run seed
npm run dev
```

- `npm run seed` inserts six occasion listings (downloads dealer photos when allowed; otherwise a placeholder SVG) and applies Drizzle migrations.
- `npm run dev` starts the app at [http://localhost:3000](http://localhost:3000).

Migrations also apply when the app first opens the database (`next dev`, `next start`, or `npm run db:migrate`). After schema edits, generate SQL with `npm run db:generate`.

The public roster API is unauthenticated.

Priority-spec choices (header dialog) persist in `localStorage` as `carcompare.prioritySpecKeys`.

Roster brand, fuel, and transmission filters are select boxes. Their options are the distinct values present on cars in the database (the full roster, not the current filtered subset), so a newly added brand or fuel shows up on the next page load.

## REST API

Create a car (nullable listing fields default to `null` if omitted):

```bash
curl -sS -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{"brand":"Volkswagen","model":"Polo","priceCents":1095000}'
```

List with filters and sort (`sort`: `price` | `odometer` | `year` | `horsepower` | `consumption`):

```bash
curl -sS "http://localhost:3000/api/cars?brand=Volkswagen&fuel=petrol&minPriceCents=1000000&maxOdometerKm=150000&appleCarPlay=true&sort=price&sortDir=asc"
```

Fetch, patch, and delete:

```bash
curl -sS http://localhost:3000/api/cars/<id>
curl -sS -X PATCH http://localhost:3000/api/cars/<id> \
  -H "Content-Type: application/json" \
  -d '{"year":2018,"odometerKm":84936}'
curl -sS -X DELETE http://localhost:3000/api/cars/<id>
```

Images (`files` field, jpeg/png/webp, max 8 MiB each):

```bash
curl -sS -X POST http://localhost:3000/api/cars/<id>/images \
  -F "files=@./photo.jpg;type=image/jpeg"
curl -sS -X DELETE http://localhost:3000/api/cars/<id>/images/<imageId>
```

A saved image path like `uploads/<carId>/<file>.jpg` is available at `http://localhost:3000/uploads/<carId>/<file>.jpg`.

## Deploy (Dokploy)

Use either the **Dockerfile** in this repo or Nixpacks. The app listens on `PORT=3000` and `HOSTNAME=0.0.0.0`.

Mount a persistent volume at `/app/data` (SQLite + uploads). No extra services are required.

### Preview deployments

The production app (`cc.sandercokart.com`) has GitHub preview deployments enabled in Dokploy, using the same wildcard as Sander's Codehouse staging: `*.sandercokart.com` with HTTPS via the `cloudflare-dns` Traefik resolver. Opening a pull request **against `main`** (the provider branch) spins up an isolated preview on port `3000` at a host like `preview-<app>-<id>.sandercokart.com`, comments the URL on the PR, and tears it down when the PR closes. At most five previews run at once; only repository collaborators can trigger them. Production auto-deploys stay on `main` only.

Local parity:

```bash
docker compose up --build
```

Do not bake `data/carcompare.db` or listing photos into the image; they belong on the volume. After first boot, run `npm run seed` once in an environment that can write that volume (or copy a seeded `data/` tree onto it).
