import Link from "next/link";
import { notFound } from "next/navigation";
import { CarGallery } from "@/components/car-gallery";
import { DealerMap } from "@/components/dealer-map";
import { KentekenLinks } from "@/components/kenteken-links";
import { PriorityStrip } from "@/components/priority-strip";
import { SpecList } from "@/components/spec-list";
import { buttonVariants } from "@/components/ui/button";
import { getCar } from "@/lib/cars-client";
import { carTitle, formatOdometerKm, formatPriceCents, MISSING } from "@/lib/format";
import { resolveRequestOrigin } from "@/lib/request-origin";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const origin = await resolveRequestOrigin();
  const car = await getCar(id, { origin });
  if (!car) notFound();

  return (
    <article className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground/15 pb-4">
        <div className="grid gap-1">
          <p className="font-mono text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase">
            Listing
          </p>
          <h1 className="font-heading text-4xl font-medium tracking-tight">
            {carTitle(car)}
          </h1>
          <p className="font-mono text-lg text-[var(--price)]">{formatPriceCents(car.priceCents)}</p>
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            {car.odometerKm == null ? MISSING : formatOdometerKm(car.odometerKm)}
          </p>
        </div>
        {car.listingUrl ? (
          <a
            href={car.listingUrl}
            className={cn(buttonVariants({ variant: "outline" }), "font-mono text-xs tracking-wide uppercase")}
            target="_blank"
            rel="noreferrer"
          >
            Original listing
          </a>
        ) : null}
      </div>

      <PriorityStrip car={car} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
        <CarGallery car={car} />
        <SpecList car={car} />
      </div>
      <div className="grid gap-8 border-t border-foreground/12 pt-6 md:grid-cols-2">
        <KentekenLinks plate={car.licensePlate} />
        <DealerMap name={car.sellerName} city={car.sellerCity} address={car.sellerAddress} />
      </div>
      <p>
        <Link href="/" className="text-sm underline underline-offset-4">
          Back to roster
        </Link>
      </p>
    </article>
  );
}
