import type { Car, CarsQuery, RosterFacets } from "@/lib/car-schema";
import { CarCard } from "@/components/car-card";
import { CompareBar } from "@/components/compare-bar";
import { RosterToolbar } from "@/components/roster-toolbar";

export function RosterView({
  cars,
  query,
  facets,
}: {
  cars: Car[];
  query: CarsQuery;
  facets: RosterFacets;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 pb-24">
      <RosterToolbar query={query} facets={facets} matchCount={cars.length} />
      {cars.length === 0 ? (
        <p className="text-muted-foreground">No cars match these filters.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <li key={car.id}>
              <CarCard car={car} />
            </li>
          ))}
        </ul>
      )}
      <CompareBar />
    </div>
  );
}
