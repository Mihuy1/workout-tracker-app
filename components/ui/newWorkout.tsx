import { useWorkout } from "@/app/contexts/workoutContext";
import { getSavedPresetByTitle } from "@/app/storage/completedExercises";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import Workout from "./workout";

type NewWorkoutProps = {
  presetTitle?: string | null;
};

export function NewWorkout({ presetTitle }: NewWorkoutProps) {
  const { exercises, addExercise, checkIfExerciseAlreadyAdded } = useWorkout();
  const [seconds, setSeconds] = useState(0);

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

  useEffect(() => {
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: number) => {
    if (time >= 3600) {
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const secs = time % 60;
      return `${hours}h ${minutes}m`;
    } else if (time >= 60) {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return `${minutes}m ${seconds}s`;
    } else {
      return `${time}s`;
    }
  };

  return (
    <View style={styles.container}>
      <Text>{formatTime(seconds)}</Text>
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
