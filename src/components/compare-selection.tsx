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

function readIds(): string[] {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string").slice(0, MAX_COMPARE);
  } catch {
    return [];
  }
}

function getServerSnapshot(): string {
  return "";
}

type CompareSelection = {
  ids: string[];
  toggle: (id: string) => void;
  setSelected: (id: string, selected: boolean) => void;
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
      const current = readIds();
      persist(
        current.includes(id)
          ? current.filter((item) => item !== id)
          : current.length >= MAX_COMPARE
            ? current
            : [...current, id],
      );
    },
    [persist],
  );

  const setSelected = useCallback(
    (id: string, selected: boolean) => {
      const current = readIds();
      if (selected) {
        if (current.includes(id) || current.length >= MAX_COMPARE) return;
        persist([...current, id]);
        return;
      }
      if (!current.includes(id)) return;
      persist(current.filter((item) => item !== id));
    },
    [persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo(
    () => ({ ids, toggle, setSelected, clear, max: MAX_COMPARE }),
    [ids, toggle, setSelected, clear],
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
