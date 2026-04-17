import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { setActiveState, getActiveStateId, stateOptions, type StateId } from "@/data/mockData";

interface StateContextType {
  stateId: StateId;
  setStateId: (id: StateId) => void;
  options: typeof stateOptions;
}

const StateContext = createContext<StateContextType | null>(null);

export function StateProvider({ children }: { children: ReactNode }) {
  const [stateId, setStateIdLocal] = useState<StateId>(getActiveStateId());

  const setStateId = useCallback((id: StateId) => {
    setActiveState(id);
    setStateIdLocal(id);
  }, []);

  return (
    <StateContext.Provider value={{ stateId, setStateId, options: stateOptions }}>
      {children}
    </StateContext.Provider>
  );
}

export function useStateSelection() {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error("useStateSelection must be used within StateProvider");
  return ctx;
}
