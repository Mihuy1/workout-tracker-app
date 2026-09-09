import {
  RestTimerAction,
  RestTimerRun,
  transitionRestTimer,
} from "@/utils/restTimer";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as Haptics from "expo-haptics";
import { AppState } from "react-native";

type RestTimerActions = {
  triggerRestTimer: (seconds: number) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  adjustRestTimer: (deltaMs: number) => void;
  clearRestTimer: () => void;
  expireRestTimer: () => void;
};

const RestTimerStateContext = createContext<
  { restTimerRun: RestTimerRun | null } | undefined
>(undefined);
const RestTimerActionsContext = createContext<RestTimerActions | undefined>(
  undefined,
);

export const RestTimerProvider = ({ children }: { children: ReactNode }) => {
  const [restTimerRun, setRestTimerRun] = useState<RestTimerRun | null>(null);
  const restTimerRef = useRef<RestTimerRun | null>(null);
  const nextRunId = useRef(0);

  const dispatch = useCallback((action: RestTimerAction) => {
    const previous = restTimerRef.current;
    const next = transitionRestTimer(previous, action, Date.now());
    if (next === previous) return;
    restTimerRef.current = next;
    setRestTimerRun(next);
    if (previous && !next && action.type !== "clear" && action.type !== "start")
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(console.warn);
  }, []);

  const actions = useMemo<RestTimerActions>(
    () => ({
      triggerRestTimer: (seconds: number) =>
        dispatch({ type: "start", seconds, id: ++nextRunId.current }),
      pauseRestTimer: () => dispatch({ type: "pause" }),
      resumeRestTimer: () => dispatch({ type: "resume" }),
      adjustRestTimer: (deltaMs: number) =>
        dispatch({ type: "adjust", deltaMs }),
      clearRestTimer: () => dispatch({ type: "clear" }),
      expireRestTimer: () => dispatch({ type: "expire" }),
    }),
    [dispatch],
  );

  useEffect(() => {
    if (restTimerRun?.status !== "running") return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if (timeout !== undefined) clearTimeout(timeout);
      const remaining = restTimerRun.endsAt - Date.now();
      timeout = setTimeout(
        () => {
          dispatch({ type: "expire" });
          // A clock adjustment or an early callback must not strand a running timer.
          if (restTimerRef.current === restTimerRun) schedule();
        },
        Math.max(0, Math.min(remaining, 2_147_483_647)),
      );
    };
    schedule();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        dispatch({ type: "expire" });

        if (restTimerRef.current === restTimerRun) schedule();
      }
    });

    return () => {
      if (timeout !== undefined) clearTimeout(timeout);
      subscription.remove();
    };
  }, [restTimerRun, dispatch]);

  const value = useMemo(() => ({ restTimerRun }), [restTimerRun]);

  return (
    <RestTimerActionsContext.Provider value={actions}>
      <RestTimerStateContext.Provider value={value}>
        {children}
      </RestTimerStateContext.Provider>
    </RestTimerActionsContext.Provider>
  );
};

export function useRestTimer() {
  const context = useContext(RestTimerStateContext);
  if (!context)
    throw new Error("useRestTimer must be used within a RestTimerProvider");
  return context;
}

export function useRestTimerActions() {
  const context = useContext(RestTimerActionsContext);
  if (!context)
    throw new Error(
      "useRestTimerActions must be used within a RestTimerProvider",
    );
  return context;
}
