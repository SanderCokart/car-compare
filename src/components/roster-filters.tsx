"use client";

import { useRouter } from "next/navigation";
import {
  FUEL_TYPES,
  SORT_KEYS,
  TRANSMISSIONS,
  type CarsQuery,
  type FuelType,
  type SortKey,
  type Transmission,
} from "@/lib/car-schema";
import { ROSTER_FEATURE_CHIPS, carsHref } from "@/lib/cars-query";
import { formatFuelType, formatTransmission } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const PRICE_MIN_EUR = 0;
const PRICE_MAX_EUR = 25_000;
const KM_MIN = 0;
const KM_MAX = 200_000;

const sortLabels: Record<SortKey, string> = {
  price: "Price",
  odometer: "Odometer",
  year: "Year",
  horsepower: "Horsepower",
  consumption: "Consumption",
};

function eurosToCents(euros: number): number {
  return Math.round(euros) * 100;
}

function centsToEuros(cents: number): number {
  return Math.round(cents / 100);
}

export function RosterFilters({
  query,
  idPrefix = "filter",
}: {
  query: CarsQuery;
  idPrefix?: string;
}) {
  const router = useRouter();

  function push(next: CarsQuery) {
    router.push(carsHref(next));
  }

  const minPriceEur =
    query.minPriceCents != null ? centsToEuros(query.minPriceCents) : PRICE_MIN_EUR;
  const maxPriceEur =
    query.maxPriceCents != null ? centsToEuros(query.maxPriceCents) : PRICE_MAX_EUR;
  const minKm = query.minOdometerKm ?? KM_MIN;
  const maxKm = query.maxOdometerKm ?? KM_MAX;

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-brand`}>Brand</Label>
          <Input
            id={`${idPrefix}-brand`}
            defaultValue={query.brand ?? ""}
            placeholder="Any brand"
            onBlur={(event) => {
              const brand = event.target.value.trim();
              push({ ...query, brand: brand || undefined });
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-fuel`}>Fuel</Label>
          <Select
            value={query.fuel ?? "all"}
            onValueChange={(value) =>
              push({
                ...query,
                fuel: value === "all" ? undefined : (value as FuelType),
              })
            }
          >
            <SelectTrigger id={`${idPrefix}-fuel`} className="w-full">
              <SelectValue placeholder="Any fuel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any fuel</SelectItem>
              {FUEL_TYPES.map((fuel) => (
                <SelectItem key={fuel} value={fuel}>
                  {formatFuelType(fuel)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-transmission`}>Transmission</Label>
          <Select
            value={query.transmission ?? "all"}
            onValueChange={(value) =>
              push({
                ...query,
                transmission: value === "all" ? undefined : (value as Transmission),
              })
            }
          >
            <SelectTrigger id={`${idPrefix}-transmission`} className="w-full">
              <SelectValue placeholder="Any transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any transmission</SelectItem>
              {TRANSMISSIONS.map((item) => (
                <SelectItem key={item} value={item}>
                  {formatTransmission(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-sort`}>Sort</Label>
          <div className="flex gap-2">
            <Select
              value={query.sort ?? "price"}
              onValueChange={(value) => push({ ...query, sort: value as SortKey })}
            >
              <SelectTrigger id={`${idPrefix}-sort`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {sortLabels[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={query.sortDir ?? "asc"}
              onValueChange={(value) =>
                push({ ...query, sortDir: value as "asc" | "desc" })
              }
            >
              <SelectTrigger aria-label="Sort direction" className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Asc</SelectItem>
                <SelectItem value="desc">Desc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Price</Label>
            <span className="text-muted-foreground">
              €{minPriceEur.toLocaleString("en-NL")} – €
              {maxPriceEur.toLocaleString("en-NL")}
            </span>
          </div>
          <Slider
            min={PRICE_MIN_EUR}
            max={PRICE_MAX_EUR}
            step={500}
            defaultValue={[minPriceEur, maxPriceEur]}
            onValueCommit={(value) => {
              const [min, max] = value;
              push({
                ...query,
                minPriceCents: min <= PRICE_MIN_EUR ? undefined : eurosToCents(min),
                maxPriceCents: max >= PRICE_MAX_EUR ? undefined : eurosToCents(max),
              });
            }}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Odometer</Label>
            <span className="text-muted-foreground">
              {minKm.toLocaleString("en-NL")} – {maxKm.toLocaleString("en-NL")} km
            </span>
          </div>
          <Slider
            min={KM_MIN}
            max={KM_MAX}
            step={5000}
            defaultValue={[minKm, maxKm]}
            onValueCommit={(value) => {
              const [min, max] = value;
              push({
                ...query,
                minOdometerKm: min <= KM_MIN ? undefined : min,
                maxOdometerKm: max >= KM_MAX ? undefined : max,
              });
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ROSTER_FEATURE_CHIPS.map((chip) => {
          const active = query[chip.key] === true;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => push({ ...query, [chip.key]: active ? undefined : true })}
            >
              <Badge variant={active ? "default" : "outline"}>{chip.label}</Badge>
            </button>
          );
        })}
      </div>

      <Button type="button" variant="ghost" className="justify-self-start" onClick={() => push({})}>
        Clear filters
      </Button>
    </div>
  );
}
