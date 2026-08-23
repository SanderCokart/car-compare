This is a Next.js 16 car comparison helper. SQLite lives at `data/carcompare.db`; listing photos are stored under `data/uploads` and served from `/uploads/...`.

## Getting Started

```bash
npm install
npm run dev
```

Migrations apply automatically the first time the app opens the database (dev server, `next start`, or `npm run db:migrate`). Generate new SQL after schema edits with `npm run db:generate`.

Open [http://localhost:3000](http://localhost:3000). The public roster API is unauthenticated.

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
