import { useWorkoutActions } from "@/app/contexts/workoutActionsContext";
import { useWorkoutState } from "@/app/contexts/workoutStateContext";
import {
  getAllLatestExercisesMap,
  getSavedPresetByTitle,
} from "@/app/storage/completedExercises";
import { Exercise, SetRow } from "@/types/workout";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Button, FlatList, StyleSheet, View } from "react-native";
import LiveWorkoutTimer from "../liveWorkoutTImer";
import { RestTimer } from "./RestTimer";
import { Workout } from "./workout";

const EMPTY_PREFILLED_SETS: SetRow[] = [];

type NewWorkoutProps = {
  presetTitle?: string | null;
  startedAt: number;
};

export function NewWorkout({ presetTitle, startedAt }: NewWorkoutProps) {
  const { exercises } = useWorkoutState();
  const { addExercises } = useWorkoutActions();
  const [historyMap, setHistoryMap] = useState<Record<string, any>>({});

  const loadedPresetRef = useRef<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const map = await getAllLatestExercisesMap();
      setHistoryMap(map);
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (!presetTitle) return;

    if (loadedPresetRef.current === presetTitle) return;

    let cancelled = false;

    const loadPreset = async () => {
      const presetExercises = (await getSavedPresetByTitle(presetTitle)) as
        | Exercise[]
        | null;
      if (cancelled) return;
      if (!presetExercises || presetExercises.length === 0) return;

      loadedPresetRef.current = presetTitle;

      const existingExerciseNames = new Set(
        exercises.map((exercise) => exercise.name),
      );

      const exercisesToAdd: Exercise[] = [];

      for (const exercise of presetExercises) {
        if (existingExerciseNames.has(exercise.name)) {
          continue;
        }

        existingExerciseNames.add(exercise.name);

        exercisesToAdd.push({
          ...exercise,
          sets: exercise.sets.map((set) => ({
            ...set,
            complete: false,
          })),
        });
      }

      if (exercisesToAdd.length > 0) {
        addExercises(exercisesToAdd);
      }
    };
    loadPreset();

    return () => {
      cancelled = true;
    };
  }, [presetTitle, exercises, addExercises]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <LiveWorkoutTimer startedAt={startedAt} />

        <FlatList
          style={styles.exerciseList}
          data={exercises}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 5 }}>
              <Workout
                exercise={item}
                prefilledSets={
                  historyMap[item.name]?.sets ?? EMPTY_PREFILLED_SETS
                }
                fallbackRestTime={historyMap[item.name]?.restTime || 120}
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
