import { useWorkoutActions } from "@/contexts/workoutActionsContext";
import { useWorkoutState } from "@/contexts/workoutStateContext";
import { getRoutine } from "@/storage/routineRepository";
import {
  getBaselines,
  getLatestExercisePerformances,
  LatestExercisePerformance,
} from "@/storage/workoutRepository";
import { SetRow } from "@/types/workout";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import { Button, FlatList, StyleSheet, View } from "react-native";
import LiveWorkoutTimer from "../liveWorkoutTImer";
import { RestTimer } from "./RestTimer";
import { Workout } from "./workout";

const EMPTY_PREFILLED_SETS: SetRow[] = [];

type NewWorkoutProps = {
  routineId?: string | null;
  startedAt: number;
};

export function NewWorkout({ routineId, startedAt }: NewWorkoutProps) {
  const db = useSQLiteContext();
  const { exercises, prBaselines } = useWorkoutState();
  const { addExercises, setExerciseBaselines } = useWorkoutActions();
  const [historyMap, setHistoryMap] = useState<
    Partial<Record<string, LatestExercisePerformance>>
  >({});

  const exerciseIdKeys = JSON.stringify(
    exercises.map((ex) => ex.exerciseId).sort(),
  );

  const loadedPresetRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const exerciseIds = JSON.parse(exerciseIdKeys) as string[];

    const loadBaselines = async () => {
      const missingIds = exerciseIds.filter(
        (id) => prBaselines[id] === undefined,
      );

      if (missingIds.length === 0) return;

      const baselines = await getBaselines(db, missingIds);

      if (cancelled) return;

      setExerciseBaselines(baselines);
    };

    loadBaselines();

    return () => {
      cancelled = true;
    };
  }, [db, exerciseIdKeys, setExerciseBaselines, prBaselines]);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      const exerciseIds = JSON.parse(exerciseIdKeys) as string[];

      const history = await getLatestExercisePerformances(db, exerciseIds);

      if (!cancelled) setHistoryMap(history);
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [db, exerciseIdKeys]);

  useEffect(() => {
    let cancelled = false;

    if (!routineId) return;
    if (loadedPresetRef.current === routineId) return;

    const loadPreset = async () => {
      const routine = await getRoutine(db, routineId);

      if (cancelled) return;
      if (!routine) return;

      loadedPresetRef.current = routineId;

      const existingExerciseIds = new Set(exercises.map((ex) => ex.exerciseId));

      const exercisesToAdd = routine.exercises.filter(
        (exercise) => !existingExerciseIds.has(exercise.exerciseId),
      );

      if (exercisesToAdd.length > 0) {
        addExercises(exercisesToAdd);
      }
    };
    loadPreset();

    return () => {
      cancelled = true;
    };
  }, [db, routineId, exercises, addExercises]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <LiveWorkoutTimer startedAt={startedAt} />

        <FlatList
          style={styles.exerciseList}
          data={exercises}
          keyExtractor={(item) => item.exerciseId}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 5 }}>
              <Workout
                exercise={item}
                prefilledSets={
                  historyMap[item.exerciseId]?.sets ?? EMPTY_PREFILLED_SETS
                }
                fallbackRestTime={historyMap[item.exerciseId]?.restTime ?? 120}
                prBaseline={prBaselines[item.exerciseId]}
              />
            </View>
          )}
        />

        <Button
          title="Add an exercise"
          onPress={() => router.push("/exercise-list")}
        />
      </View>
      <RestTimer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  exerciseList: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
});
