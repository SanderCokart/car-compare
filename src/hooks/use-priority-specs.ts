"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { SpecKey } from "@/lib/car-schema";
import {
  PRIORITY_SPEC_STORAGE_KEY,
  defaultPrioritySpecKeys,
  parsePrioritySpecKeys,
  writePrioritySpecKeys,
} from "@/lib/priority-specs";

const CHANGE_EVENT = "carcompare-priority-specs";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getSnapshot(): string {
  return window.localStorage.getItem(PRIORITY_SPEC_STORAGE_KEY) ?? "";
}

function getServerSnapshot(): string {
  return "";
}

export function usePrioritySpecKeys() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const keys = useMemo(() => {
    if (!raw) return defaultPrioritySpecKeys();
    try {
      return parsePrioritySpecKeys(JSON.parse(raw));
    } catch {
      return defaultPrioritySpecKeys();
    }
  }, [raw]);

  const setKeys = useCallback((next: SpecKey[]) => {
    const value = next.length > 0 ? next : defaultPrioritySpecKeys();
    writePrioritySpecKeys(value);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { keys, setKeys, ready: true };
}
