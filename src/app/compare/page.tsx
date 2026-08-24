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

export const dynamic = "force-dynamic";

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
      <div className="mx-auto grid max-w-6xl gap-3 px-4 py-12">
        <p className="font-mono text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase">
          Side by side
        </p>
        <h1 className="font-heading text-4xl font-medium tracking-tight italic">Compare</h1>
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
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="mb-6 border-b border-foreground/15 pb-4">
        <p className="font-mono text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase">
          Side by side
        </p>
        <h1 className="font-heading text-4xl font-medium tracking-tight italic">Compare</h1>
      </div>
      <div className="overflow-x-auto border border-foreground/12 bg-card">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 bg-card p-3 text-left font-mono text-xs tracking-wide text-muted-foreground uppercase">
                Spec
              </th>
              {cars.map((car) => (
                <th key={car.id} className="min-w-48 p-3 text-left align-top">
                  <Link
                    href={`/cars/${car.id}`}
                    className="font-heading text-lg font-medium hover:underline"
                  >
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
          className="bg-primary px-3 py-2 font-mono text-xs tracking-[0.18em] text-primary-foreground uppercase"
        >
          {GROUP_LABELS[group]}
        </td>
      </tr>
      {items.map((item) => {
        const differs = valuesDiffer(cars, item.key);
        return (
          <tr key={item.key} className="border-b border-foreground/10">
            <th className="sticky left-0 bg-card px-3 py-2 text-left font-normal text-muted-foreground">
              {specLabel(item.key)}
            </th>
            {cars.map((car) => (
              <td
                key={car.id}
                className={cn("px-3 py-2", differs && "bg-accent font-medium")}
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
