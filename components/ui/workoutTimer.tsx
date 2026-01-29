import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

export function WorkoutTimer() {
  const startTime = useRef<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const formatElapsed = (ms: number) => {
    let totalSeconds: number = Math.floor(ms / 1000);

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

  useEffect(() => {
    const id = setInterval(() => {
      setElapsedTime(Date.now() - startTime.current);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <View>
      <Text> {formatElapsed(elapsedTime)} </Text>
    </View>
  );
}
