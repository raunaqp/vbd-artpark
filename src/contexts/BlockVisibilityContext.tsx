import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRole } from "./RoleContext";
import { useStateSelection } from "./StateContext";
import { BLOCK_REGISTRY, type BlockTabId } from "@/config/blockRegistry";

type VisibilityMap = Partial<Record<BlockTabId, Record<string, boolean>>>;

interface BlockVisibilityContextType {
  isVisible: (tab: BlockTabId, blockId: string) => boolean;
  setVisible: (tab: BlockTabId, blockId: string, value: boolean) => void;
  setAllForTab: (tab: BlockTabId, value: boolean) => void;
  resetTab: (tab: BlockTabId) => void;
  resetAll: () => void;
  visibility: VisibilityMap;
}

const BlockVisibilityContext = createContext<BlockVisibilityContextType | null>(null);

function storageKey(userName: string, stateId: string) {
  return `block_visibility::${userName}::${stateId}`;
}

function loadFromStorage(userName: string, stateId: string): VisibilityMap {
  try {
    const raw = localStorage.getItem(storageKey(userName, stateId));
    return raw ? (JSON.parse(raw) as VisibilityMap) : {};
  } catch {
    return {};
  }
}

export function BlockVisibilityProvider({ children }: { children: ReactNode }) {
  const { currentRole } = useRole();
  const { stateId } = useStateSelection();
  const userName = currentRole.userName;

  const [visibility, setVisibility] = useState<VisibilityMap>(() => loadFromStorage(userName, stateId));

  // Reload when scope changes (user or state)
  useEffect(() => {
    setVisibility(loadFromStorage(userName, stateId));
  }, [userName, stateId]);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(storageKey(userName, stateId), JSON.stringify(visibility));
    } catch { /* ignore */ }
  }, [visibility, userName, stateId]);

  const api = useMemo<BlockVisibilityContextType>(() => ({
    visibility,
    isVisible: (tab, blockId) => {
      const v = visibility[tab]?.[blockId];
      return v === undefined ? true : v;
    },
    setVisible: (tab, blockId, value) => {
      setVisibility((prev) => ({
        ...prev,
        [tab]: { ...(prev[tab] ?? {}), [blockId]: value },
      }));
    },
    setAllForTab: (tab, value) => {
      const blocks = BLOCK_REGISTRY[tab] ?? [];
      const next: Record<string, boolean> = {};
      for (const b of blocks) next[b.id] = value;
      setVisibility((prev) => ({ ...prev, [tab]: next }));
    },
    resetTab: (tab) => {
      setVisibility((prev) => {
        const { [tab]: _, ...rest } = prev;
        return rest;
      });
    },
    resetAll: () => setVisibility({}),
  }), [visibility]);

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
