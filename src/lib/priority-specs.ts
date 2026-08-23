import {
  DEFAULT_PRIORITY_SPEC_KEYS,
  prioritySpecKeysSchema,
  type SpecKey,
} from "@/lib/car-schema";

export const PRIORITY_SPEC_STORAGE_KEY = "carcompare.prioritySpecKeys";

export function defaultPrioritySpecKeys(): SpecKey[] {
  return [...DEFAULT_PRIORITY_SPEC_KEYS];
}

export function parsePrioritySpecKeys(raw: unknown): SpecKey[] {
  const parsed = prioritySpecKeysSchema.safeParse(raw);
  if (!parsed.success || parsed.data.length === 0) {
    return defaultPrioritySpecKeys();
  }
  return parsed.data;
}

export function readPrioritySpecKeys(): SpecKey[] {
  if (typeof window === "undefined") return defaultPrioritySpecKeys();
  try {
    const stored = window.localStorage.getItem(PRIORITY_SPEC_STORAGE_KEY);
    if (!stored) return defaultPrioritySpecKeys();
    return parsePrioritySpecKeys(JSON.parse(stored));
  } catch {
    return defaultPrioritySpecKeys();
  }
}

export function writePrioritySpecKeys(keys: SpecKey[]): void {
  window.localStorage.setItem(PRIORITY_SPEC_STORAGE_KEY, JSON.stringify(keys));
}
