"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCompareSelection } from "@/components/compare-selection";

export function CompareBar() {
  const { ids, clear } = useCompareSelection();
  if (ids.length === 0) return null;

  const href = `/compare?ids=${ids.join(",")}`;
  const canCompare = ids.length >= 2;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <p className="text-sm">
          {ids.length} car{ids.length === 1 ? "" : "s"} selected
          {ids.length >= 4 ? " (maximum 4)" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
          {canCompare ? (
            <Button size="sm" asChild>
              <Link href={href}>Compare</Link>
            </Button>
          ) : (
            <Button size="sm" disabled>
              Compare
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
