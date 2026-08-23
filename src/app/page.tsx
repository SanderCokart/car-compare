import { RosterView } from "@/components/roster-view";
import { listCarFacets, listCars } from "@/lib/cars-client";
import { parseCarsQuery } from "@/lib/cars-query";
import { resolveRequestOrigin } from "@/lib/request-origin";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = parseCarsQuery(params);
  const origin = await resolveRequestOrigin();
  const [cars, facets] = await Promise.all([
    listCars(query, { origin }),
    listCarFacets({ origin }),
  ]);

  return <RosterView cars={cars} query={query} facets={facets} />;
}
