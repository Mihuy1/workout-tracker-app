import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Button, Easing, StyleSheet, View } from "react-native";
import { WorkoutTimer } from "./workoutTimer";

interface RestTimerProps {
  duration: number;
  restStartTrigger: number;
}

export const RestTimer = ({ duration, restStartTrigger }: RestTimerProps) => {
  const durationMs = duration * 1000;

  const [timeLeft, setTimeLeft] = useState(durationMs);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // const animatedProgress = useRef(new Animated.Value(1)).current;
  const [animatedProgress] = useState<Animated.Value>(() => new Animated.Value(1));
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
      }, 100);
    },
    [animatedProgress],
  );

  useEffect(() => {
    if (restStartTrigger === 0) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    // setIsActive(false);
    isActiveRef.current = false;

    // setIsPaused(false);
    isPausedRef.current = false;

    // setTimeLeft(durationMs);
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
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.bar,
              {
                transformOrigin: "left center",
                transform: [{ scaleX: animatedProgress }],
              },
            ]}
          />
          <WorkoutTimer elapsedTimeMs={timeLeft} />
          <View style={styles.timeAdjustRow}>
            <Button title="-15" onPress={decreaseBy15} disabled={!isActive} />
            <Button title="+15" onPress={incraseBy15} disabled={!isActive} />
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Start/Resume"
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
    backgroundColor: "#ccc",
    borderRadius: 10,
    margin: 10,
    padding: 10,
  },
  bar: {
    height: 20,
    backgroundColor: "#333",
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  timeAdjustRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
