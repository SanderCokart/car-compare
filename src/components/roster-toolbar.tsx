"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import type { CarsQuery, RosterFacets } from "@/lib/car-schema";
import { RosterFilters } from "@/components/roster-filters";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function RosterToolbar({
  query,
  facets,
}: {
  query: CarsQuery;
  facets: RosterFacets;
}) {
  return (
    <div className="grid gap-5">
      <div className="flex items-end justify-between gap-3 border-b border-foreground/15 pb-4">
        <div className="grid gap-1">
          <p className="font-mono text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase">
            Listing board
          </p>
          <h1 className="font-heading text-4xl font-medium tracking-tight italic">Roster</h1>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden">
              <SlidersHorizontalIcon />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Narrow the roster. Choices are stored in the URL.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-6">
              <RosterFilters query={query} facets={facets} idPrefix="mobile-filter" />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden border border-foreground/12 bg-card p-4 md:block">
        <RosterFilters query={query} facets={facets} idPrefix="desktop-filter" />
      </div>
    </div>
  );
}
