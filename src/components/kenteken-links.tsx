import {
  KENTEKEN_RDW_OVI_DEFAULT_URL,
  KENTEKEN_RDW_OVI_URL,
  finnikKentekenUrl,
} from "@/lib/car-schema";
import { normalizeKenteken } from "@/lib/kenteken";
import { MISSING } from "@/lib/format";

export function KentekenLinks({ plate }: { plate: string | null }) {
  if (!plate) {
    return <p className="text-muted-foreground">License plate {MISSING}</p>;
  }

  const normalized = normalizeKenteken(plate);
  const finnik = normalized ? finnikKentekenUrl(normalized) : null;

  return (
    <div className="grid gap-1 text-sm">
      <p>
        Plate: <span className="font-medium">{plate}</span>
      </p>
      <p>
        <a
          href={KENTEKEN_RDW_OVI_URL}
          className="underline underline-offset-4 hover:text-foreground"
          target="_blank"
          rel="noreferrer"
        >
          Check on RDW OVI
        </a>
        <span className="text-muted-foreground"> (official)</span>
      </p>
      <p>
        <a
          href={KENTEKEN_RDW_OVI_DEFAULT_URL}
          className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
          target="_blank"
          rel="noreferrer"
        >
          RDW OVI (default page)
        </a>
      </p>
      {finnik ? (
        <p>
          <a
            href={finnik}
            className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            Finnik (secondary)
          </a>
        </p>
      ) : null}
    </div>
  );
}
