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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-primary-foreground/15 bg-primary p-3 text-primary-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <p className="font-mono text-xs tracking-wide uppercase">
          {ids.length} car{ids.length === 1 ? "" : "s"} selected
          {ids.length >= 4 ? " (maximum 4)" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            Clear
          </Button>
          {canCompare ? (
            <Button
              size="sm"
              asChild
              className="bg-background text-foreground hover:bg-background/90"
            >
              <Link href={href}>Compare</Link>
            </Button>
          ) : (
            <Button size="sm" disabled className="bg-background/40 text-primary-foreground">
              Compare
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
