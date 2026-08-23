"use client";

import { formatSpecValue, specLabel } from "@/lib/format";
import type { Car } from "@/lib/car-schema";
import { usePrioritySpecKeys } from "@/hooks/use-priority-specs";

export function PrioritySidebar({ car }: { car: Car }) {
  const { keys } = usePrioritySpecKeys();

  return (
    <aside className="sticky top-14 z-30 flex h-[calc(100dvh-3.5rem)] w-52 shrink-0 flex-col overflow-y-auto border-l bg-muted/40 p-4 sm:w-60 lg:w-80">
      <h2 className="mb-3 text-sm font-medium">Most important to you</h2>
      <dl className="grid gap-0">
        {keys.map((key) => (
          <div
            key={key}
            className="flex items-baseline justify-between gap-3 border-b py-2.5 last:border-b-0"
          >
            <dt className="text-muted-foreground">{specLabel(key)}</dt>
            <dd className="text-right font-medium">{formatSpecValue(car, key)}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
