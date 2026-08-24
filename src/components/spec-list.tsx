import {
  SPEC_GROUPS,
  SPEC_KEYS,
  type Car,
  type SpecGroup,
} from "@/lib/car-schema";
import { formatSpecValue, specLabel } from "@/lib/format";

const GROUP_LABELS: Record<SpecGroup, string> = {
  basics: "Basics",
  drivetrain: "Drivetrain",
  safety: "Safety",
  comfort: "Comfort",
  cargo: "Cargo",
};

export function SpecList({ car }: { car: Car }) {
  return (
    <div className="grid gap-6">
      {SPEC_GROUPS.map((group) => {
        const items = SPEC_KEYS.filter((item) => item.group === group);
        return (
          <section key={group} className="grid gap-2">
            <h2 className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
              {GROUP_LABELS[group]}
            </h2>
            <dl className="grid gap-2 sm:grid-cols-2">
              {items.map((item) => (
                <div key={item.key} className="flex items-baseline justify-between gap-3 border-b py-1.5">
                  <dt className="text-muted-foreground">{specLabel(item.key)}</dt>
                  <dd className="text-right font-medium">{formatSpecValue(car, item.key)}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
