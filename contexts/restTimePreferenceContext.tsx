import {
  getDefaultRestTime,
  saveDefaultRestTime,
} from "@/storage/preferencesRepository";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type RestTimePreferenceContextType = {
  defaultRestTime: number;
  setDefaultRestTime: (restTime: number) => Promise<void>;
};

const RestTimePreferenceContext = createContext<
  RestTimePreferenceContextType | undefined
>(undefined);

export function RestTimePreferenceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [defaultRestTime, setDefaultRestTimeState] = useState<number>(120);

  useEffect(() => {
    let active = true;

    getDefaultRestTime()
      .then((defaultRestTime) => {
        if (active) setDefaultRestTimeState(defaultRestTime);
      })
      .catch((error) =>
        console.error("failed to fetch default rest time:", error),
      );

    return () => {
      active = false;
    };
  }, []);

  const setDefaultRestTime = useCallback(async (restTime: number) => {
    await saveDefaultRestTime(restTime);
    setDefaultRestTimeState(restTime);
  }, []);

  const value = useMemo(
    () => ({
      defaultRestTime,
      setDefaultRestTime,
    }),
    [defaultRestTime, setDefaultRestTime],
  );

  return (
    <RestTimePreferenceContext.Provider value={value}>
      {children}
    </RestTimePreferenceContext.Provider>
  );
}

export const useDefaultRestTime = () => {
  const context = useContext(RestTimePreferenceContext);
  if (!context)
    throw new Error(
      "useDefaultRestTime must be used within a RestTimePreferenceProvider ",
    );

  return context;
};

export const DEFAULT_REST_TIME_OPTIONS = [
  { value: 30, label: "30s" },
  { value: 60, label: "1m" },
  { value: 90, label: "1m 30s" },
  { value: 120, label: "2m" },
  { value: 150, label: "2m 30s" },
  { value: 180, label: "3m" },
  { value: 210, label: "3m 30s" },
  { value: 240, label: "4m" },
  { value: 270, label: "4m 30s" },
  { value: 300, label: "5m" },
];
