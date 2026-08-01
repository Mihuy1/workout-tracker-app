import { useRestTimer } from "@/contexts/restTimerContext";
import { Colors } from "@/constants/theme";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Button,
  Easing,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { WorkoutTimer } from "./workoutTimer";

export const RestTimer = () => {
  const { restDuration, restStartTrigger } = useRestTimer();

  const durationMs = restDuration * 1000;

  const theme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  const [timeLeft, setTimeLeft] = useState(durationMs);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [animatedProgress] = useState<Animated.Value>(
    () => new Animated.Value(1),
  );
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);
  const isActiveRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const timeLeftRef = useRef<number>(timeLeft);

  useEffect(() => {
    isActiveRef.current = isActive;
    timeLeftRef.current = timeLeft;
  }, [isActive, timeLeft]);

  const adjustByMs = (deltaMs: number) => {
    if (!isActiveRef.current || !endTimeRef.current) return;

    const now = Date.now();

    const prevMsLeft = Math.max(0, endTimeRef.current - now);
    const newMsLeft = Math.max(0, prevMsLeft + deltaMs);
    const clampedMsLeft = Math.min(durationMs, newMsLeft);

    endTimeRef.current = now + clampedMsLeft;
    setTimeLeft(clampedMsLeft);
    timeLeftRef.current = clampedMsLeft;

    animatedProgress.stopAnimation((currentValue) => {
      const ratio = prevMsLeft > 0 ? clampedMsLeft / prevMsLeft : 1;
      const nextValue = Math.max(0, Math.min(1, currentValue * ratio));

      animatedProgress.setValue(nextValue);

      Animated.timing(animatedProgress, {
        toValue: 0,
        duration: clampedMsLeft,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    });

    if (clampedMsLeft === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsActive(false);
      isActiveRef.current = false;
    }
  };

  const incraseBy15 = () => adjustByMs(15000);
  const decreaseBy15 = () => adjustByMs(-15000);

  const start = useCallback(
    (initialTimeLeft?: number) => {
      const nextTimeLeft = initialTimeLeft ?? timeLeftRef.current;
      if (isActiveRef.current || nextTimeLeft <= 0) return;

      setIsActive(true);
      isActiveRef.current = true;
      setTimeLeft(nextTimeLeft);
      timeLeftRef.current = nextTimeLeft;

      setIsPaused(false);
      isPausedRef.current = false;

      endTimeRef.current = Date.now() + nextTimeLeft;

      Animated.timing(animatedProgress, {
        toValue: 0,
        duration: nextTimeLeft,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();

      intervalRef.current = setInterval(() => {
        if (!endTimeRef.current) return;

        const msLeft = Math.max(0, endTimeRef.current - Date.now());
        setTimeLeft(msLeft);
        timeLeftRef.current = msLeft;

        if (msLeft === 0) {
          clearInterval(intervalRef.current);
          setIsActive(false);
          isActiveRef.current = false;
        }
      }, 1000);
    },
    [animatedProgress],
  );

  useEffect(() => {
    if (restStartTrigger === 0) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    isActiveRef.current = false;
    isPausedRef.current = false;
    timeLeftRef.current = durationMs;

    animatedProgress.setValue(1);
    endTimeRef.current = null;

    start(durationMs);
  }, [animatedProgress, durationMs, restStartTrigger, start]);

  const pause = () => {
    if (!isActiveRef.current) return;

    setIsActive(false);
    setIsPaused(true);
    isActiveRef.current = false;
    isPausedRef.current = true;

    if (intervalRef.current) clearInterval(intervalRef.current);

    if (endTimeRef.current) {
      const msLeft = Math.max(0, endTimeRef.current - Date.now());
      setTimeLeft(msLeft);
      timeLeftRef.current = msLeft;
    }

    animatedProgress.stopAnimation();
  };

  const restart = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    setIsActive(false);
    isActiveRef.current = false;

    setIsPaused(false);
    isPausedRef.current = false;

    setTimeLeft(durationMs);
    timeLeftRef.current = durationMs;

    animatedProgress.setValue(1);
    endTimeRef.current = null;

    start(durationMs);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, []);

  return (
    <>
      {(isActive || isPaused) && (
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
            <Button title="-15" onPress={decreaseBy15} disabled={!isActive} />
            <Button title="+15" onPress={incraseBy15} disabled={!isActive} />
          </View>

          <Animated.View
            style={[
              styles.bar,
              {
                backgroundColor: colors.barColor,
                transformOrigin: "left center",
                transform: [{ scaleX: animatedProgress }],
              },
            ]}
          />

          <View style={styles.buttonRow}>
            <Button
              title="Resume"
              onPress={() => start()}
              disabled={isActive}
            />
            <Button title="Pause" onPress={pause} disabled={!isActive} />
            <Button title="Restart" onPress={restart} />
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
