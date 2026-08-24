import { googleMapsEmbedUrl } from "@/lib/car-schema";
import { MISSING } from "@/lib/format";

export function DealerMap({
  name,
  city,
  address,
}: {
  name: string | null;
  city: string | null;
  address: string | null;
}) {
  const heading = [name, city].filter(Boolean).join(" · ") || "Dealer";

  return (
    <section className="grid gap-3">
      <div>
        <h2 className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
          Dealer
        </h2>
        <p className="text-muted-foreground">{heading}</p>
        <p className="text-sm">{address ?? MISSING}</p>
      </div>
      {address ? (
        <iframe
          title="Dealer map"
          src={googleMapsEmbedUrl(address)}
          className="h-64 w-full border border-foreground/12"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : null}
    </section>
  );
}
