import { createContext, ReactNode, useContext, useState } from "react";

type restTimerContextType = {
  restDuration: number;
  restStartTrigger: number;
  triggerRestTimer: (seconds: number) => void;
  clearRestTimer: () => void;
};

const RestTimerContext = createContext<restTimerContextType | undefined>(
  undefined,
);

export const RestTimerProvider = ({ children }: { children: ReactNode }) => {
  const [restDuration, setRestDuration] = useState<number>(0);
  const [restStartTrigger, setRestStartTrigger] = useState<number>(0);
  const triggerRestTimer = (seconds: number) => {
    setRestDuration(seconds);
    setRestStartTrigger((prev) => prev + 1);
  };

  const clearRestTimer = () => {
    setRestDuration(0);
    setRestStartTrigger(0);
  };

  return (
    <RestTimerContext.Provider
      value={{
        restDuration,
        restStartTrigger,
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
