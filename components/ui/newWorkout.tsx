import { useWorkout } from "@/app/contexts/workoutContext";
import { getSavedPresetByTitle } from "@/app/storage/completedExercises";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Button, StyleSheet, View } from "react-native";
import Workout from "./workout";

type NewWorkoutProps = {
  presetTitle?: string | null;
};

export function NewWorkout({ presetTitle }: NewWorkoutProps) {
  const { exercises, addExercise, checkIfExerciseAlreadyAdded } = useWorkout();

  const loadedPresetRef = useRef<string | null>(null);

  useEffect(() => {
    if (!presetTitle) return;

    if (loadedPresetRef.current === presetTitle) return;

    let cancelled = false;

    const loadPreset = async () => {
      const presetExercises = await getSavedPresetByTitle(presetTitle);
      if (cancelled) return;
      if (!presetExercises || presetExercises.length === 0) return;

      loadedPresetRef.current = presetTitle;

      for (const ex of presetExercises) {
        for (const set of ex.sets) {
          set.complete = false;
        }

        if (!checkIfExerciseAlreadyAdded(ex.name)) {
          addExercise(ex);
        }
      }
    };
    loadPreset();

    return () => {
      cancelled = true;
    };
  }, [presetTitle, addExercise, checkIfExerciseAlreadyAdded]);

  return (
    <View style={styles.container}>
      {exercises.map((exercise, index) => (
        <View key={index} style={{ marginBottom: 5 }}>
          <Workout
            workoutName={exercise.name}
            workoutMechanic={exercise.mechanic}
          />
        </View>
      ))}
      <Button
        title="Add an exercise"
        onPress={() => router.push("/exercise-list")}
      ></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
});
