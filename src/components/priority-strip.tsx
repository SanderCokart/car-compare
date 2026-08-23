"use client";

import { Badge } from "@/components/ui/badge";
import { formatSpecValue, specLabel } from "@/lib/format";
import type { Car, SpecKey } from "@/lib/car-schema";
import { usePrioritySpecKeys } from "@/hooks/use-priority-specs";

export function PriorityStrip({ car }: { car: Car }) {
  const { keys } = usePrioritySpecKeys();

  return (
    <ul className="flex flex-wrap gap-1.5">
      {keys.map((key) => (
        <PriorityChip key={key} specKey={key} car={car} />
      ))}
    </ul>
  );
}

function PriorityChip({ specKey, car }: { specKey: SpecKey; car: Car }) {
  return (
    <li>
      <Badge variant="secondary" className="h-auto max-w-full px-2 py-1 font-normal">
        <span className="text-muted-foreground">{specLabel(specKey)}</span>
        <span className="truncate font-medium">{formatSpecValue(car, specKey)}</span>
      </Badge>
    </li>
  );
}
