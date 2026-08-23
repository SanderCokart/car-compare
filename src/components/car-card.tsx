"use client";

import Link from "next/link";
import { useCompareSelection } from "@/components/compare-selection";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="h-full py-0">
      <Link href={`/cars/${car.id}`} className="block">
        <div className="relative aspect-[4/3] bg-muted">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- listing photos are volume paths
            <img src={imageSrc(photo.path)} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              No photo
            </div>
          )}
        </div>
      </Link>
      <CardHeader>
        <CardTitle>
          <Link href={`/cars/${car.id}`} className="hover:underline">
            {carTitle(car)}
          </Link>
        </CardTitle>
        <p className="text-lg font-medium">{formatPriceCents(car.priceCents)}</p>
        <p className="text-muted-foreground">
          {car.odometerKm == null ? MISSING : formatOdometerKm(car.odometerKm)}
        </p>
      </CardHeader>
      <CardContent className="grid gap-3">
        {chips.length > 0 ? (
          <ul className="flex flex-wrap gap-1">
            {chips.map((chip) => (
              <li key={chip.key}>
                <Badge variant="outline">{chip.label}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-2">
          <Checkbox
            id={`compare-${car.id}`}
            checked={selected}
            disabled={atMax}
            onCheckedChange={(value) => setSelected(car.id, value === true)}
          />
          <Label htmlFor={`compare-${car.id}`} className="font-normal">
            Compare
          </Label>
        </div>
      </CardFooter>
    </Card>
  );
}
