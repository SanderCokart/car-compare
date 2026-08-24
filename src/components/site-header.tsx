import Link from "next/link";
import { PrioritySpecDialog } from "@/components/priority-spec-dialog";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-foreground/15 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="group grid leading-none">
          <span className="font-mono text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase">
            Dutch occasions
          </span>
          <span className="font-heading text-[1.35rem] font-medium tracking-tight italic">
            Car compare
          </span>
        </Link>
        <PrioritySpecDialog />
      </div>
    </header>
  );
}
