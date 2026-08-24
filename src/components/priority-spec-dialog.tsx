"use client";

import { useMemo, useState } from "react";
import { SPEC_GROUPS, SPEC_KEYS, type SpecGroup, type SpecKey } from "@/lib/car-schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { defaultPrioritySpecKeys } from "@/lib/priority-specs";
import { usePrioritySpecKeys } from "@/hooks/use-priority-specs";

const GROUP_LABELS: Record<SpecGroup, string> = {
  basics: "Basics",
  drivetrain: "Drivetrain",
  safety: "Safety",
  comfort: "Comfort",
  cargo: "Cargo",
};

export function PrioritySpecDialog() {
  const { keys, setKeys } = usePrioritySpecKeys();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<SpecKey[]>(keys);

  function handleOpenChange(next: boolean) {
    if (next) setDraft(keys);
    setOpen(next);
  }

  function toggle(key: SpecKey, checked: boolean) {
    setDraft((current) =>
      checked ? [...current, key] : current.filter((item) => item !== key),
    );
  }

  const grouped = useMemo(
    () =>
      SPEC_GROUPS.map((group) => ({
        group,
        items: SPEC_KEYS.filter((item) => item.group === group),
      })),
    [],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="font-mono text-xs tracking-wide uppercase">
          Priorities
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>What is most important to you?</DialogTitle>
          <DialogDescription>
            Choose specs to highlight on the roster, detail, and compare views.
            Your selection is saved in this browser.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {grouped.map(({ group, items }) => (
            <section key={group} className="grid gap-2">
              <h3 className="text-sm font-medium">{GROUP_LABELS[group]}</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((item) => {
                  const checked = draft.includes(item.key);
                  const id = `priority-${item.key}`;
                  return (
                    <div key={item.key} className="flex items-center gap-2">
                      <Checkbox
                        id={id}
                        checked={checked}
                        onCheckedChange={(value) => toggle(item.key, value === true)}
                      />
                      <Label htmlFor={id} className="font-normal">
                        {item.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDraft(defaultPrioritySpecKeys())}
          >
            Reset defaults
          </Button>
          <Button
            type="button"
            onClick={() => {
              setKeys(draft);
              setOpen(false);
            }}
            disabled={draft.length === 0}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
