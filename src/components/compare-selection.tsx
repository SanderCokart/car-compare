"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const MAX_COMPARE = 4;
const STORAGE_KEY = "carcompare.compareIds";
const CHANGE_EVENT = "carcompare-compare-ids";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getSnapshot(): string {
  return sessionStorage.getItem(STORAGE_KEY) ?? "";
}

function getServerSnapshot(): string {
  return "";
}

type CompareSelection = {
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
  max: number;
};

const CompareSelectionContext = createContext<CompareSelection | null>(null);

export function CompareSelectionProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ids = useMemo(() => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((id): id is string => typeof id === "string").slice(0, MAX_COMPARE);
    } catch {
      return [];
    }
  }, [raw]);

  const persist = useCallback((next: string[]) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      persist(
        ids.includes(id)
          ? ids.filter((item) => item !== id)
          : ids.length >= MAX_COMPARE
            ? ids
            : [...ids, id],
      );
    },
    [ids, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo(
    () => ({ ids, toggle, clear, max: MAX_COMPARE }),
    [ids, toggle, clear],
  );

  return (
    <CompareSelectionContext.Provider value={value}>
      {children}
    </CompareSelectionContext.Provider>
  );
}

export function useCompareSelection() {
  const value = useContext(CompareSelectionContext);
  if (!value) {
    throw new Error("useCompareSelection must be used within CompareSelectionProvider");
  }
  return value;
}
