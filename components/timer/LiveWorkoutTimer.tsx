import { useEffect, useState } from "react";
import { WorkoutTimer } from "./WorkoutTimer";

interface LiveWorkoutTimerProps {
  startedAt: number;
}

export function LiveWorkoutTimer({ startedAt }: LiveWorkoutTimerProps) {
  const [elapsedTimeMs, setElapsedTimeMs] = useState(
    () => Date.now() - startedAt,
  );

  useEffect(() => {
    const id = setInterval(() => {
      setElapsedTimeMs(Date.now() - startedAt);
    }, 1000);

    return () => clearInterval(id);
  }, [startedAt]);

  return <WorkoutTimer elapsedTimeMs={elapsedTimeMs} />;
}
