<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Self-contained Next.js 16 app (Turbopack) with an embedded SQLite database via `better-sqlite3`. There is no separate database/service to start — do not look for Postgres/Docker/etc. Standard commands are in `README.md` and `package.json` scripts.

- Startup dependencies are installed by the update script (`npm ci`). Native `better-sqlite3` compiles during install.
- Data lives under `data/` (SQLite `carcompare.db` + `data/uploads/`) and is gitignored, so a fresh pod starts with an empty roster. Run `npm run seed` once to insert the six sample listings; it is idempotent and downloads dealer photos when egress is allowed, otherwise falls back to a placeholder SVG (still exits 0). It is not in the update script because it is per-checkout data setup, not a dependency refresh.
- Migrations auto-apply when the app first opens the DB (`npm run dev`/`start`) or via `npm run db:migrate`; after schema edits regenerate SQL with `npm run db:generate`.
- Run the dev server with `npm run dev` (serves on `http://localhost:3000`). The roster page and the unauthenticated REST API under `/api/cars` are the core functionality.
- `npm run lint` currently reports 2 pre-existing `react-hooks` errors in `src/components/roster-filters.tsx`; these are existing code issues, not environment problems.
