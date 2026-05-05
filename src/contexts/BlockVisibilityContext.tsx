import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useStateSelection } from "./StateContext";
import { BLOCK_REGISTRY, type BlockTabId } from "@/config/blockRegistry";

type VisibilityMap = Partial<Record<BlockTabId, Record<string, boolean>>>;

interface BlockVisibilityContextType {
  // Read committed (applied) visibility — what end users see
  isVisible: (tab: BlockTabId, blockId: string) => boolean;
  // Read draft visibility — what the analyst is currently editing
  isDraftVisible: (tab: BlockTabId, blockId: string) => boolean;
  setVisible: (tab: BlockTabId, blockId: string, value: boolean) => void;
  setAllForTab: (tab: BlockTabId, value: boolean) => void;
  resetTab: (tab: BlockTabId) => void;
  resetAll: () => void;
  saveChanges: () => void;
  discardChanges: () => void;
  isDirty: boolean;
  visibility: VisibilityMap;
  draft: VisibilityMap;
}

const BlockVisibilityContext = createContext<BlockVisibilityContextType | null>(null);

// State-level (shared across all users) storage key
function storageKey(stateId: string) {
  return `block_visibility::state::${stateId}`;
}

function loadFromStorage(stateId: string): VisibilityMap {
  try {
    const raw = localStorage.getItem(storageKey(stateId));
    return raw ? (JSON.parse(raw) as VisibilityMap) : {};
  } catch {
    return {};
  }
}

function deepEqual(a: VisibilityMap, b: VisibilityMap) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function BlockVisibilityProvider({ children }: { children: ReactNode }) {
  const { stateId } = useStateSelection();

  const [visibility, setVisibility] = useState<VisibilityMap>(() => loadFromStorage(stateId));
  const [draft, setDraft] = useState<VisibilityMap>(() => loadFromStorage(stateId));

  // Reload when state scope changes — also discards any unsaved draft
  useEffect(() => {
    const loaded = loadFromStorage(stateId);
    setVisibility(loaded);
    setDraft(loaded);
  }, [stateId]);

  // Cross-tab sync: when another tab/user saves changes for this state, pick them up
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey(stateId)) {
        const next = e.newValue ? (JSON.parse(e.newValue) as VisibilityMap) : {};
        setVisibility((prevVis) => {
          setDraft((prevDraft) => (deepEqual(prevDraft, prevVis) ? next : prevDraft));
          return next;
        });
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [stateId]);

  const isDirty = useMemo(() => !deepEqual(visibility, draft), [visibility, draft]);

  const api = useMemo<BlockVisibilityContextType>(() => ({
    visibility,
    draft,
    isDirty,
    isVisible: (tab, blockId) => {
      const v = visibility[tab]?.[blockId];
      return v === undefined ? true : v;
    },
    isDraftVisible: (tab, blockId) => {
      const v = draft[tab]?.[blockId];
      return v === undefined ? true : v;
    },
    setVisible: (tab, blockId, value) => {
      setDraft((prev) => ({
        ...prev,
        [tab]: { ...(prev[tab] ?? {}), [blockId]: value },
      }));
    },
    setAllForTab: (tab, value) => {
      const blocks = BLOCK_REGISTRY[tab] ?? [];
      const next: Record<string, boolean> = {};
      for (const b of blocks) next[b.id] = value;
      setDraft((prev) => ({ ...prev, [tab]: next }));
    },
    resetTab: (tab) => {
      setDraft((prev) => {
        const { [tab]: _, ...rest } = prev;
        return rest;
      });
    },
    resetAll: () => setDraft({}),
    saveChanges: () => {
      try {
        localStorage.setItem(storageKey(stateId), JSON.stringify(draft));
      } catch { /* ignore */ }
      setVisibility(draft);
    },
    discardChanges: () => setDraft(visibility),
  }), [visibility, draft, isDirty, stateId]);

  return (
    <BlockVisibilityContext.Provider value={api}>
      {children}
    </BlockVisibilityContext.Provider>
  );
}

export function useBlockVisibility() {
  const ctx = useContext(BlockVisibilityContext);
  if (!ctx) throw new Error("useBlockVisibility must be used within BlockVisibilityProvider");
  return ctx;
}
