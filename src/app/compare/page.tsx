import Link from "next/link";
import { PriorityStrip } from "@/components/priority-strip";
import { getCarsByIds } from "@/lib/cars-client";
import { parseCompareIds } from "@/lib/cars-query";
import {
  SPEC_GROUPS,
  SPEC_KEYS,
  type Car,
  type SpecGroup,
  type SpecKey,
} from "@/lib/car-schema";
import { carTitle, formatSpecValue, specLabel } from "@/lib/format";
import { resolveRequestOrigin } from "@/lib/request-origin";
import { cn } from "@/lib/utils";

const GROUP_LABELS: Record<SpecGroup, string> = {
  basics: "Basics",
  drivetrain: "Drivetrain",
  safety: "Safety",
  comfort: "Comfort",
  cargo: "Cargo",
};

function valuesDiffer(cars: Car[], key: SpecKey): boolean {
  const values = cars.map((car) => formatSpecValue(car, key));
  return new Set(values).size > 1;
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const ids = parseCompareIds(params.ids);
  const origin = await resolveRequestOrigin();
  const cars = await getCarsByIds(ids, { origin });

  if (cars.length < 2) {
    return (
      <div className="mx-auto grid max-w-6xl gap-3 px-4 py-10">
        <h1 className="text-2xl font-medium">Compare</h1>
        <p className="text-muted-foreground">
          Select 2 to 4 cars from the roster to compare them.
        </p>
        <Link href="/" className="text-sm underline underline-offset-4">
          Back to roster
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-medium">Compare</h1>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 bg-background p-3 text-left font-medium">Spec</th>
              {cars.map((car) => (
                <th key={car.id} className="min-w-48 p-3 text-left align-top font-medium">
                  <Link href={`/cars/${car.id}`} className="hover:underline">
                    {carTitle(car)}
                  </Link>
                  <div className="mt-3 font-normal">
                    <PriorityStrip car={car} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPEC_GROUPS.map((group) => {
              const items = SPEC_KEYS.filter((item) => item.group === group);
              return (
                <GroupRows key={group} group={group} items={items} cars={cars} />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupRows({
  group,
  items,
  cars,
}: {
  group: SpecGroup;
  items: typeof SPEC_KEYS[number][];
  cars: Car[];
}) {
  return (
    <>
      <tr>
        <td
          colSpan={cars.length + 1}
          className="bg-muted/60 px-3 py-2 font-medium"
        >
          {GROUP_LABELS[group]}
        </td>
      </tr>
      {items.map((item) => {
        const differs = valuesDiffer(cars, item.key);
        return (
          <tr key={item.key} className="border-b">
            <th className="sticky left-0 bg-background px-3 py-2 text-left font-normal text-muted-foreground">
              {specLabel(item.key)}
            </th>
            {cars.map((car) => (
              <td
                key={car.id}
                className={cn("px-3 py-2", differs && "bg-amber-50 font-medium dark:bg-amber-950/40")}
              >
                {formatSpecValue(car, item.key)}
              </td>
            ))}
          </tr>
        );
      })}
    </>
  );
}
