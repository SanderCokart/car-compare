"use client";

import Link from "next/link";
import { useCompareSelection } from "@/components/compare-selection";
import { PriorityStrip } from "@/components/priority-strip";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Car } from "@/lib/car-schema";
import { ROSTER_FEATURE_CHIPS } from "@/lib/cars-query";
import {
  MISSING,
  carTitle,
  formatOdometerKm,
  formatPriceCents,
  imageSrc,
} from "@/lib/format";

export function CarCard({ car }: { car: Car }) {
  const { ids, setSelected, max } = useCompareSelection();
  const selected = ids.includes(car.id);
  const atMax = !selected && ids.length >= max;
  const photo = car.images[0];
  const chips = ROSTER_FEATURE_CHIPS.filter((chip) => car[chip.key] === true);

  return (
    <article className="flex h-full flex-col overflow-hidden border border-foreground/12 bg-card">
      <Link href={`/cars/${car.id}`} className="block">
        <div className="relative aspect-[5/3] bg-muted">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- listing photos are volume paths
            <img src={imageSrc(photo.path)} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center font-mono text-xs tracking-wider text-muted-foreground uppercase">
              No photo
            </div>
          )}
          <p className="absolute right-0 bottom-0 bg-primary px-2.5 py-1 font-mono text-sm text-primary-foreground">
            {formatPriceCents(car.priceCents)}
          </p>
        </div>
      </Link>
      <div className="grid flex-1 gap-3 p-4">
        <div className="grid gap-1">
          <h2 className="font-heading text-xl leading-tight font-medium tracking-tight">
            <Link href={`/cars/${car.id}`} className="hover:underline">
              {carTitle(car)}
            </Link>
          </h2>
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            {car.odometerKm == null ? MISSING : formatOdometerKm(car.odometerKm)}
          </p>
        </div>
        <PriorityStrip car={car} />
        {chips.length > 0 ? (
          <ul className="flex flex-wrap gap-1">
            {chips.map((chip) => (
              <li key={chip.key}>
                <Badge variant="outline">{chip.label}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-auto flex items-center gap-2 border-t border-foreground/10 pt-3">
          <Checkbox
            id={`compare-${car.id}`}
            checked={selected}
            disabled={atMax}
            onCheckedChange={(value) => setSelected(car.id, value === true)}
          />
          <Label htmlFor={`compare-${car.id}`} className="font-mono text-xs tracking-wide uppercase">
            Compare
          </Label>
        </div>
      </div>
    </article>
  );
}
