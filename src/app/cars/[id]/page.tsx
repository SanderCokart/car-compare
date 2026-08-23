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
    <article className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl font-medium">{carTitle(car)}</h1>
          <p className="text-xl font-medium">{formatPriceCents(car.priceCents)}</p>
          <p className="text-muted-foreground">
            {car.odometerKm == null ? MISSING : formatOdometerKm(car.odometerKm)}
          </p>
        </div>
        {car.listingUrl ? (
          <a
            href={car.listingUrl}
            className={cn(buttonVariants({ variant: "outline" }))}
            target="_blank"
            rel="noreferrer"
          >
            Original listing
          </a>
        ) : null}
      </div>

      <PriorityStrip car={car} />
      <CarGallery car={car} />
      <SpecList car={car} />
      <KentekenLinks plate={car.licensePlate} />
      <DealerMap name={car.sellerName} city={car.sellerCity} address={car.sellerAddress} />
      <p>
        <Link href="/" className="text-sm underline underline-offset-4">
          Back to roster
        </Link>
      </p>
    </article>
  );
}
