import { ThemedText } from "@/components/ui/ThemedText";
import { timerSeconds } from "@/utils/restTimer";
import { View, type TextStyle } from "react-native";

type WorkoutTimerProps = {
  fontSize?: number;
  fontWeight?: TextStyle["fontWeight"];
  lineHeight?: number;
  elapsedTimeMs: number;
  countdown?: boolean;
};

export function WorkoutTimer({
  fontSize = 16,
  fontWeight = "400",
  lineHeight = 24,
  elapsedTimeMs,
  countdown = false,
}: WorkoutTimerProps) {
  const formatElapsed = (ms: number) => {
    let totalSeconds: number = timerSeconds(ms, countdown);

    const hours: number = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;

    const minutes: number = Math.floor(totalSeconds / 60);

    const seconds: number = totalSeconds % 60;

    const hDisplay: string = hours.toString().padStart(2, "0");
    const mDisplay: string = minutes.toString().padStart(2, "0");
    const sDisplay: string = seconds.toString().padStart(2, "0");

    if (hours > 0) return `${hDisplay}h ${mDisplay}m ${sDisplay}s`;
    return `${mDisplay}m ${sDisplay}s`;
  };

  return (
    <View>
      <ThemedText
        style={{
          fontSize,
          fontWeight,
          lineHeight,
        }}
      >
        {formatElapsed(elapsedTimeMs)}
      </ThemedText>
    </View>
  );
}
