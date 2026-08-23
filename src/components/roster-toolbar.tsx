"use client";

import { useState } from "react";
import { SlidersHorizontalIcon } from "lucide-react";
import type { CarsQuery, RosterFacets } from "@/lib/car-schema";
import { queryHasConstraints } from "@/lib/cars-filter";
import { RosterFilters } from "@/components/roster-filters";
import { Badge } from "@/components/ui/badge";
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
  matchCount,
}: {
  query: CarsQuery;
  facets: RosterFacets;
  matchCount: number;
}) {
  const constrained = queryHasConstraints(query);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <div className="min-w-0">
          <h1 className="text-xl font-medium">Roster</h1>
          <p className="text-sm text-muted-foreground">
            {matchCount === 1 ? "1 car" : `${matchCount} cars`}
          </p>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontalIcon />
              Filters
              {constrained ? (
                <Badge variant="secondary" className="h-5 px-1.5">
                  On
                </Badge>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Narrow the roster. Choices are stored in the URL.
              </SheetDescription>
            </SheetHeader>
            {mobileOpen ? (
              <div className="px-4 pb-6">
                <RosterFilters
                  query={query}
                  facets={facets}
                  matchCount={matchCount}
                  idPrefix="mobile-filter"
                />
              </div>
            ) : null}
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden md:block">
        <h1 className="mb-4 text-2xl font-medium">Roster</h1>
        <RosterFilters
          query={query}
          facets={facets}
          matchCount={matchCount}
          idPrefix="desktop-filter"
        />
      </div>
    </div>
  );
}
