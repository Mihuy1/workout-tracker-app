import { useEffect, useRef, useState } from "react";
import { Animated, Button, StyleSheet, View } from "react-native";
import { WorkoutTimer } from "./workoutTimer";

interface RestTimerProps {
  duration: number;
}

export const RestTimer = ({ duration }: RestTimerProps) => {
  const durationMs = duration * 1000;

  const [timeLeft, setTimeLeft] = useState(durationMs);
  const [isActive, setIsActive] = useState(false);

  const animatedProgress = useRef(new Animated.Value(1)).current;
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);

  const start = () => {
    if (isActive || timeLeft <= 0) return;
    setIsActive(true);

    endTimeRef.current = Date.now() + timeLeft;

    Animated.timing(animatedProgress, {
      toValue: 0,
      duration: timeLeft,
      useNativeDriver: false,
    }).start();

    intervalRef.current = setInterval(() => {
      if (!endTimeRef.current) return;

      const msLeft = Math.max(0, endTimeRef.current - Date.now());
      setTimeLeft(msLeft);

      if (msLeft === 0) {
        clearInterval(intervalRef.current);
        setIsActive(false);
      }
    }, 100);
  };

  const pause = () => {
    if (!isActive) return;

    setIsActive(false);

    if (intervalRef.current) clearInterval(intervalRef.current);

    if (endTimeRef.current) {
      const msLeft = Math.max(0, endTimeRef.current - Date.now());
      setTimeLeft(msLeft);
    }

    animatedProgress.stopAnimation();
  };

  const restart = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    setTimeLeft(durationMs);
    animatedProgress.setValue(1);
    endTimeRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const animatedWidth = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bar, { width: animatedWidth }]} />
      <WorkoutTimer elapsedTimeMs={timeLeft} />

      <View style={styles.buttonRow}>
        <Button title="Start/Resume" onPress={start} disabled={isActive} />
        <Button title="Pause" onPress={pause} disabled={!isActive} />
        <Button title="Restart" onPress={restart} />
      </View>
    </View>
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
});
