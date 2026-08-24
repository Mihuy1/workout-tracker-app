import { Colors } from "@/constants/theme";
import { useRestTimer } from "@/contexts/restTimerContext";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Button,
  Easing,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { WorkoutTimer } from "./WorkoutTimer";

type TimerStatus = "idle" | "running" | "paused";

export const RestTimer = () => {
  const { restTimerRun } = useRestTimer();
  const [restTimerStatus, setRestTimerStatus] = useState<TimerStatus>("idle");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [animatedProgress] = useState<Animated.Value>(
    () => new Animated.Value(1),
  );

  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);

  const theme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  const start = useCallback(
    (initialTimeLeft: number) => {
      if (initialTimeLeft <= 0) return;

      setRestTimerStatus("running");

      if (intervalRef.current) clearInterval(intervalRef.current);

      setTimeLeft(initialTimeLeft);
      endTimeRef.current = Date.now() + initialTimeLeft;

      Animated.timing(animatedProgress, {
        toValue: 0,
        duration: initialTimeLeft,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();

      intervalRef.current = setInterval(() => {
        if (!endTimeRef.current) return;

        const remaining = Math.max(0, endTimeRef.current - Date.now());

        setTimeLeft(remaining);

        if (remaining === 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = undefined;
          }

          setRestTimerStatus("idle");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }, 1000);
    },
    [animatedProgress],
  );

  const resume = () => {
    if (restTimerStatus !== "paused" || timeLeft <= 0) return;

    start(timeLeft);
  };

  const pause = () => {
    if (!endTimeRef.current) return;

    const remaining = Math.max(0, endTimeRef.current - Date.now());

    setTimeLeft(remaining);
    setRestTimerStatus("paused");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    animatedProgress.stopAnimation();
  };

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    animatedProgress.stopAnimation();
    endTimeRef.current = null;
  }, [animatedProgress]);

  const adjustByMs = (delta: number) => {
    if (
      restTimerStatus !== "running" ||
      !restTimerRun ||
      endTimeRef.current === null
    )
      return;

    const now = Date.now();
    const previousTimeLeft = Math.max(0, endTimeRef.current - now);

    const nextTimeLeft = Math.max(0, previousTimeLeft + delta);

    endTimeRef.current = now + nextTimeLeft;
    setTimeLeft(nextTimeLeft);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    animatedProgress.stopAnimation((currentProgress) => {
      const nextProgress =
        previousTimeLeft > 0
          ? currentProgress * (nextTimeLeft / previousTimeLeft)
          : nextTimeLeft / restTimerRun.durationMs;

      animatedProgress.setValue(Math.max(0, Math.min(1, nextProgress)));

      if (nextTimeLeft > 0) {
        Animated.timing(animatedProgress, {
          toValue: 0,
          duration: nextTimeLeft,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
      }
    });

    if (nextTimeLeft === 0) {
      if (intervalRef.current !== undefined) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }

      setRestTimerStatus("idle");
    }
  };

  const decreaseBy15 = () => {
    adjustByMs(-15000);
  };

  const increaseBy15 = () => {
    adjustByMs(15000);
  };

  useEffect(() => {
    if (!restTimerRun) return;

    const timeLeft = Math.max(0, restTimerRun.endsAt - Date.now());

    animatedProgress.setValue(1);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    start(timeLeft);

    return () => {
      stop();
    };
  }, [restTimerRun, animatedProgress, start, stop]);

  return (
    <>
      {restTimerRun &&
        (restTimerStatus === "running" || restTimerStatus === "paused") && (
          <View
            style={[
              styles.container,
              {
                backgroundColor: colors.restTimeBackground,
                borderColor: colors.restTimeBorder,
              },
            ]}
          >
            <View style={styles.restTimeText}>
              <WorkoutTimer
                fontSize={30}
                fontWeight={600}
                lineHeight={58}
                elapsedTimeMs={timeLeft}
              />
            </View>
            <View style={styles.timeAdjustRow}>
              <Button
                title="-15"
                onPress={decreaseBy15}
                disabled={restTimerStatus === "paused"}
              />
              <Button
                title="+15"
                onPress={increaseBy15}
                disabled={restTimerStatus === "paused"}
              />
            </View>

            <View
              style={[
                styles.barTrack,
                { backgroundColor: colors.restTimeBorder },
              ]}
            >
              <Animated.View
                style={[
                  styles.barFill,
                  {
                    backgroundColor: colors.barColor,
                    transformOrigin: "left center",
                    transform: [{ scaleX: animatedProgress }],
                  },
                ]}
              />
            </View>

            <View style={styles.buttonRow}>
              <Button
                title="Resume"
                onPress={() => resume()}
                disabled={restTimerStatus === "running"}
              />
              <Button
                title="Pause"
                onPress={pause}
                disabled={restTimerStatus !== "running"}
              />
              {/* <Button title="Restart" onPress={restart} /> */}
            </View>
          </View>
        )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flexShrink: 0,

    // Keep the timer visually separated from the scrollable content.
    elevation: 5, // Android
    shadowColor: "#000", // iOS
    shadowOffset: { width: 0, height: -2 }, // iOS
    shadowOpacity: 0.1, // iOS
    shadowRadius: 4, // iOS
  },
  restTimeText: {
    alignItems: "center",
  },
  bar: {
    height: 12,
    borderRadius: 10,
  },
  barTrack: {
    width: "100%",
    height: 12,
    borderRadius: 10,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    paddingBottom: 30,
  },
  timeAdjustRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
