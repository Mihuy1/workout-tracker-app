import { Colors } from "@/constants/theme";
import { useRestTimer, useRestTimerActions } from "@/contexts/restTimerContext";
import { remainingRestMs } from "@/utils/restTimer";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  Animated,
  AppState,
  Button,
  Easing,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { WorkoutTimer } from "./WorkoutTimer";

export const RestTimer = () => {
  const { restTimerRun } = useRestTimer();
  const { pauseRestTimer, resumeRestTimer, adjustRestTimer, clearRestTimer } =
    useRestTimerActions();
  const [now, setNow] = useState(Date.now);
  const [animatedProgress] = useState(() => new Animated.Value(0));

  const theme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  const timeLeft = restTimerRun
    ? Math.min(restTimerRun.durationMs, remainingRestMs(restTimerRun, now))
    : 0;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const stop = () => {
      if (timeout !== undefined) clearTimeout(timeout);
      animatedProgress.stopAnimation();
    };

    const tick = () => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (restTimerRun?.status !== "running") return;
      const remaining = remainingRestMs(restTimerRun, currentTime);
      if (remaining > 0) timeout = setTimeout(tick, remaining % 1000 || 1000);
    };

    const sync = () => {
      stop();
      if (!restTimerRun || AppState.currentState !== "active") return;

      const remaining = remainingRestMs(restTimerRun, Date.now());
      animatedProgress.setValue(
        Math.min(1, remaining / restTimerRun.durationMs),
      );
      if (restTimerRun.status === "running" && remaining > 0) {
        Animated.timing(animatedProgress, {
          toValue: 0,
          duration: remaining,
          easing: Easing.linear,
          useNativeDriver: true,
          isInteraction: false,
        }).start();
      }
      tick();
    };

    sync();

    const subscription = AppState.addEventListener("change", sync);

    return () => {
      stop();
      subscription.remove();
    };
  }, [restTimerRun, animatedProgress]);

  const adjust = (deltaMs: number) => {
    adjustRestTimer(deltaMs);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      console.warn,
    );
  };

  return (
    <>
      {restTimerRun && (
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
              countdown
            />
          </View>
          <View style={styles.timeAdjustRow}>
            <Button
              title="-15"
              onPress={() => adjust(-15000)}
              disabled={restTimerRun.status === "paused"}
            />
            <Button
              title="+15"
              onPress={() => adjust(15000)}
              disabled={restTimerRun.status === "paused"}
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
              onPress={resumeRestTimer}
              disabled={restTimerRun.status === "running"}
            />
            <Button
              title="Pause"
              onPress={pauseRestTimer}
              disabled={restTimerRun.status !== "running"}
            />
            <Button title="Skip" onPress={clearRestTimer} />
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
