"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import type { CarsQuery } from "@/lib/car-schema";
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

export function RosterToolbar({ query }: { query: CarsQuery }) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <h1 className="text-xl font-medium">Roster</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
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
              <RosterFilters query={query} idPrefix="mobile-filter" />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden md:block">
        <h1 className="mb-4 text-2xl font-medium">Roster</h1>
        <RosterFilters query={query} idPrefix="desktop-filter" />
      </div>
    </div>
  );
}
