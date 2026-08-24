"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FEATURE_FILTER_GROUPS,
  SORT_KEYS,
  type CarsQuery,
  type FeatureKey,
  type FuelType,
  type RosterFacets,
  type SortKey,
  type Transmission,
} from "@/lib/car-schema";
import { queryHasConstraints } from "@/lib/cars-filter";
import { carsHref } from "@/lib/cars-query";
import { formatFuelType, formatTransmission } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

function ceilTo(value: number, step: number): number {
  return Math.ceil(value / step) * step;
}

function parseOptionalInt(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return undefined;
  return Math.round(n);
}

function withCurrentOption<T extends { value: string; count: number }>(
  options: T[],
  current: string | undefined,
): T[] {
  if (!current) return options;
  if (options.some((option) => option.value.toLowerCase() === current.toLowerCase())) {
    return options;
  }
  return [...options, { value: current, count: 0 } as T];
}

function OptionalNumber({
  id,
  value,
  placeholder,
  min,
  max,
  onCommit,
}: {
  id: string;
  value: number | undefined;
  placeholder: string;
  min?: number;
  max?: number;
  onCommit: (next: number | undefined) => void;
}) {
  return (
    <Input
      id={id}
      key={String(value ?? "")}
      type="number"
      inputMode="numeric"
      defaultValue={value ?? ""}
      placeholder={placeholder}
      min={min}
      max={max}
      className="h-8"
      onBlur={(event) => onCommit(parseOptionalInt(event.target.value))}
      onKeyDown={(event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        onCommit(parseOptionalInt((event.target as HTMLInputElement).value));
      }}
    />
  );
}

export function RosterFilters({
  query,
  facets,
  matchCount,
  idPrefix = "filter",
}: {
  query: CarsQuery;
  facets: RosterFacets;
  matchCount: number;
  idPrefix?: string;
}) {
  const router = useRouter();
  const queryRef = useRef(query);
  queryRef.current = query;

  const [keyword, setKeyword] = useState(query.q ?? "");
  useEffect(() => {
    setKeyword(query.q ?? "");
  }, [query.q]);

  useEffect(() => {
    const trimmed = keyword.trim();
    const current = queryRef.current.q ?? "";
    if (trimmed === current) return;
    const timer = window.setTimeout(() => {
      router.push(carsHref({ ...queryRef.current, q: trimmed || undefined }));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [keyword, router]);

  function push(next: CarsQuery) {
    router.push(carsHref(next));
  }

  function commit<K extends keyof CarsQuery>(key: K, value: CarsQuery[K]) {
    if (query[key] === value) return;
    push({ ...query, [key]: value });
  }

  const priceFloorEur = centsToEuros(facets.bounds.priceCentsMin);
  const priceCeilEur = Math.max(ceilTo(centsToEuros(facets.bounds.priceCentsMax), 500), 500);
  const kmFloor = facets.bounds.odometerKmMin;
  const kmCeil = Math.max(ceilTo(facets.bounds.odometerKmMax, 5000), 5000);

  const minPriceEur =
    query.minPriceCents != null ? centsToEuros(query.minPriceCents) : priceFloorEur;
  const maxPriceEur =
    query.maxPriceCents != null ? centsToEuros(query.maxPriceCents) : priceCeilEur;
  const minKm = query.minOdometerKm ?? kmFloor;
  const maxKm = query.maxOdometerKm ?? kmCeil;

  const brands = withCurrentOption(facets.brands, query.brand);
  const models = withCurrentOption(facets.models, query.model);
  const fuels = withCurrentOption(facets.fuels, query.fuel);
  const transmissions = withCurrentOption(facets.transmissions, query.transmission);

  const selectedBrand = query.brand;
  const brandValue =
    selectedBrand == null
      ? "all"
      : (brands.find((brand) => brand.value.toLowerCase() === selectedBrand.toLowerCase())
          ?.value ?? selectedBrand);
  const selectedModel = query.model;
  const modelValue =
    selectedModel == null
      ? "all"
      : (models.find((model) => model.value.toLowerCase() === selectedModel.toLowerCase())
          ?.value ?? selectedModel);

  const canClear = queryHasConstraints(query) || query.sort != null || query.sortDir != null;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">{matchCount}</span>
          {matchCount === 1 ? " car matches" : " cars match"}
        </p>
        <Button type="button" variant="ghost" size="sm" disabled={!canClear} onClick={() => push({})}>
          Clear all
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-q`}>Keyword</Label>
          <Input
            id={`${idPrefix}-q`}
            type="search"
            value={keyword}
            placeholder="Brand, model, plate, seller…"
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-brand`}>Brand</Label>
          <Select
            value={brandValue}
            onValueChange={(value) =>
              push({
                ...query,
                brand: value === "all" ? undefined : value,
                model: undefined,
              })
            }
          >
            <SelectTrigger id={`${idPrefix}-brand`} className="w-full">
              <SelectValue placeholder="Any brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any brand</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.value} value={brand.value}>
                  {brand.value} ({brand.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-model`}>Model</Label>
          <Select
            value={modelValue}
            onValueChange={(value) =>
              push({ ...query, model: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger id={`${idPrefix}-model`} className="w-full">
              <SelectValue placeholder="Any model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any model</SelectItem>
              {models.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.value} ({model.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-fuel`}>Fuel</Label>
          <Select
            value={query.fuel ?? "all"}
            onValueChange={(value) =>
              commit("fuel", value === "all" ? undefined : (value as FuelType))
            }
          >
            <SelectTrigger id={`${idPrefix}-fuel`} className="w-full">
              <SelectValue placeholder="Any fuel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any fuel</SelectItem>
              {fuels.map((fuel) => (
                <SelectItem key={fuel.value} value={fuel.value}>
                  {formatFuelType(fuel.value)} ({fuel.count})
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
              commit(
                "transmission",
                value === "all" ? undefined : (value as Transmission),
              )
            }
          >
            <SelectTrigger id={`${idPrefix}-transmission`} className="w-full">
              <SelectValue placeholder="Any transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any transmission</SelectItem>
              {transmissions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {formatTransmission(item.value)} ({item.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1.5">
          <Label>Year</Label>
          <div className="grid grid-cols-2 gap-2">
            <OptionalNumber
              id={`${idPrefix}-min-year`}
              value={query.minYear}
              placeholder="Min"
              min={facets.bounds.yearMin}
              max={facets.bounds.yearMax}
              onCommit={(value) => commit("minYear", value)}
            />
            <OptionalNumber
              id={`${idPrefix}-max-year`}
              value={query.maxYear}
              placeholder="Max"
              min={facets.bounds.yearMin}
              max={facets.bounds.yearMax}
              onCommit={(value) => commit("maxYear", value)}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label>Horsepower</Label>
          <div className="grid grid-cols-2 gap-2">
            <OptionalNumber
              id={`${idPrefix}-min-hp`}
              value={query.minHorsepower}
              placeholder="Min"
              min={facets.bounds.horsepowerMin}
              max={facets.bounds.horsepowerMax}
              onCommit={(value) => commit("minHorsepower", value)}
            />
            <OptionalNumber
              id={`${idPrefix}-max-hp`}
              value={query.maxHorsepower}
              placeholder="Max"
              min={facets.bounds.horsepowerMin}
              max={facets.bounds.horsepowerMax}
              onCommit={(value) => commit("maxHorsepower", value)}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label>Cylinders</Label>
          <div className="grid grid-cols-2 gap-2">
            <OptionalNumber
              id={`${idPrefix}-min-cyl`}
              value={query.minCylinders}
              placeholder="Min"
              min={facets.bounds.cylindersMin}
              max={facets.bounds.cylindersMax}
              onCommit={(value) => commit("minCylinders", value)}
            />
            <OptionalNumber
              id={`${idPrefix}-max-cyl`}
              value={query.maxCylinders}
              placeholder="Max"
              min={facets.bounds.cylindersMin}
              max={facets.bounds.cylindersMax}
              onCommit={(value) => commit("maxCylinders", value)}
            />
          </div>
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
              <SelectTrigger aria-label="Sort direction" className="w-24">
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
            <span className="text-muted-foreground tabular-nums">
              €{Math.min(minPriceEur, maxPriceEur).toLocaleString("en-NL")} – €
              {Math.max(minPriceEur, maxPriceEur).toLocaleString("en-NL")}
            </span>
          </div>
          <Slider
            min={priceFloorEur}
            max={priceCeilEur}
            step={500}
            value={[
              Math.min(Math.max(minPriceEur, priceFloorEur), priceCeilEur),
              Math.max(Math.min(maxPriceEur, priceCeilEur), priceFloorEur),
            ]}
            onValueCommit={(value) => {
              const [min, max] = value;
              push({
                ...query,
                minPriceCents: min <= priceFloorEur ? undefined : eurosToCents(min),
                maxPriceCents: max >= priceCeilEur ? undefined : eurosToCents(max),
              });
            }}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Mileage</Label>
            <span className="text-muted-foreground tabular-nums">
              {Math.min(minKm, maxKm).toLocaleString("en-NL")} –{" "}
              {Math.max(minKm, maxKm).toLocaleString("en-NL")} km
            </span>
          </div>
          <Slider
            min={kmFloor}
            max={kmCeil}
            step={5000}
            value={[
              Math.min(Math.max(minKm, kmFloor), kmCeil),
              Math.max(Math.min(maxKm, kmCeil), kmFloor),
            ]}
            onValueCommit={(value) => {
              const [min, max] = value;
              push({
                ...query,
                minOdometerKm: min <= kmFloor ? undefined : min,
                maxOdometerKm: max >= kmCeil ? undefined : max,
              });
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {FEATURE_FILTER_GROUPS.map((group) => (
          <fieldset key={group.group} className="grid gap-2">
            <legend className="text-sm font-medium">{group.label}</legend>
            <ul className="grid gap-1.5">
              {group.keys.map((spec) => {
                const key = spec.key as FeatureKey;
                const active = query[key] === true;
                const count = facets.features[key] ?? 0;
                return (
                  <li key={key} className="flex items-center gap-2">
                    <Checkbox
                      id={`${idPrefix}-${key}`}
                      checked={active}
                      onCheckedChange={(value) =>
                        push({ ...query, [key]: value === true ? true : undefined })
                      }
                    />
                    <Label
                      htmlFor={`${idPrefix}-${key}`}
                      className="flex min-w-0 flex-1 items-center justify-between gap-2 font-normal"
                    >
                      <span className="truncate">{spec.label}</span>
                      <span className="shrink-0 text-muted-foreground tabular-nums">{count}</span>
                    </Label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
