import Link from "next/link";
import { PrioritySpecDialog } from "@/components/priority-spec-dialog";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="font-heading text-base font-medium tracking-tight">
          Car compare
        </Link>
        <PrioritySpecDialog />
      </div>
    </header>
  );
}
