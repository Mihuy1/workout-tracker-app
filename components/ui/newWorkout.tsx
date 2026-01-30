import { useWorkout } from "@/app/contexts/workoutContext";
import { getSavedPresetByTitle } from "@/app/storage/completedExercises";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Button, FlatList, StyleSheet, View } from "react-native";
import Workout from "./workout";
import { WorkoutTimer } from "./workoutTimer";

type NewWorkoutProps = {
  presetTitle?: string | null;
  elapsedTimeMs: number;
};

export function NewWorkout({ presetTitle, elapsedTimeMs }: NewWorkoutProps) {
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
      <WorkoutTimer elapsedTimeMs={elapsedTimeMs}></WorkoutTimer>

      <FlatList
        data={exercises}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 5 }}>
            <Workout workoutName={item.name} workoutMechanic={item.mechanic} />
          </View>
        )}
      />

      <Button
        title="Add an exercise"
        onPress={() => router.push("/exercise-list")}
      />
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
