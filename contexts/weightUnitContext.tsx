import { getWeightUnit, saveWeightUnit } from "@/storage/preferencesRepository";
import { WeightUnit } from "@/utils/weightUnits";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type WeightUnitContextType = {
  weightUnit: WeightUnit;
  setWeightUnit: (unit: WeightUnit) => Promise<void>;
};

const weightUnitContext = createContext<WeightUnitContextType | undefined>(
  undefined,
);

export const WeightUnitProvider = ({ children }: { children: ReactNode }) => {
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>("kg");

  useEffect(() => {
    let active = true;

    getWeightUnit()
      .then((savedUnit) => {
        if (active) setWeightUnitState(savedUnit);
      })
      .catch((error) => console.error("failed to fetch weight unit:", error));

    return () => {
      active = false;
    };
  }, []);

  const setWeightUnit = useCallback(async (unit: WeightUnit) => {
    await saveWeightUnit(unit);
    setWeightUnitState(unit);
  }, []);

  const value = useMemo(
    () => ({
      weightUnit,
      setWeightUnit,
    }),
    [weightUnit, setWeightUnit],
  );

  return (
    <weightUnitContext.Provider value={value}>
      {children}
    </weightUnitContext.Provider>
  );
};

export function useWeightUnit() {
  const context = useContext(weightUnitContext);

  if (!context) {
    throw new Error("useWeightUnit must be used within WeightUnitProvider");
  }

  return context;
}
