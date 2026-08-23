import { createContext, ReactNode, useContext, useRef, useState } from "react";

type RestTimerRun = {
  id: number;
  durationMs: number;
  endsAt: number;
};

type RestTimerContextType = {
  restTimerRun: RestTimerRun | null;
  triggerRestTimer: (seconds: number) => void;
  clearRestTimer: () => void;
};

const RestTimerContext = createContext<RestTimerContextType | undefined>(
  undefined,
);

export const RestTimerProvider = ({ children }: { children: ReactNode }) => {
  const [restTimerRun, setRestTimerRun] = useState<RestTimerRun | null>(null);

  const nextRunId = useRef(0);

  const triggerRestTimer = (seconds: number) => {
    if (seconds <= 0) {
      setRestTimerRun(null);
      return;
    }
    const durationMs = seconds * 1000;

    nextRunId.current += 1;

    setRestTimerRun({
      id: nextRunId.current,
      durationMs: durationMs,
      endsAt: Date.now() + durationMs,
    });
  };

  const clearRestTimer = () => {
    setRestTimerRun(null);
  };

  return (
    <RestTimerContext.Provider
      value={{
        restTimerRun,
        triggerRestTimer,
        clearRestTimer,
      }}
    >
      {children}
    </RestTimerContext.Provider>
  );
};

export const useRestTimer = () => {
  const context = useContext(RestTimerContext);
  if (!context) {
    throw new Error("useRestTimer must be used within a RestTimerProvider");
  }
  return context;
};
