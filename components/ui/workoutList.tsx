import { useWorkout } from "@/app/contexts/workoutContext";
import exercises from "@/app/datasets/exercises.json";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Exercise } from "@/types/workout";
import { router } from "expo-router";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "../themed-text";
import { ExercisePickerRow, ExercisePickerRowItem } from "./exercisePickerRow";

export function WorkoutList() {
  const [text, onChangeText] = useState("");
  const { getExercises, addExercise } = useWorkout();
  const workoutExercises = getExercises();
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const surface = useThemeColor({}, "surface");
  const placeholderColor = useThemeColor({}, "placeholder");

  const selectedExercisesNames = useMemo(
    () => new Set(workoutExercises.map((exercise) => exercise.name)),
    [workoutExercises],
  );

  const filtered = useMemo(
    () =>
      exercises.filter(
        (exercise) => !selectedExercisesNames.has(exercise.name),
      ),
    [selectedExercisesNames],
  );

  // const filtered = useMemo(() => {
  //   return exercises.filter((item) => !checkIfExerciseAlreadyAdded(item.name));
  // }, [workoutExercises]);

  const fuse = useMemo(
    () =>
      new Fuse(exercises, {
        keys: [
          { name: "name" },
          { name: "primaryMuscles" },
          { name: "equipment" },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [],
  );

  // const searchResults = useMemo(() => {
  //   if (!text) return filtered;

  //   return fuse.search(text).map((result) => result.item);
  // }, [text, fuse, filtered]);

  const searchResults = useMemo(() => {
    const query = text.trim();

    if (!query) return filtered;

    return fuse
      .search(query)
      .map((result) => result.item)
      .filter((exercise) => !selectedExercisesNames.has(exercise.name));
  }, [text, fuse, filtered, selectedExercisesNames]);

  const onAdd = (item: ExercisePickerRowItem) => {
    const exercise: Exercise = {
      name: item.name,
      mechanic: item.mechanic,
      restTime: 0,
      sets: [
        {
          id: 1,
          complete: false,
          weight: "",
          reps: "",
        },
      ],
    };

    addExercise(exercise);
    router.back();
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">Exercises</ThemedText>
      <TextInput
        value={text}
        onChangeText={onChangeText}
        placeholder="Search exercises..."
        placeholderTextColor={placeholderColor}
        autoFocus
        style={[
          styles.searchInput,
          { color: textColor, borderColor, backgroundColor: surface },
        ]}
      />
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // <Workout
          //   workoutId={item.id}
          //   workoutName={item.name}
          //   workoutMechanic={item.mechanic}
          // />
          <ExercisePickerRow item={item} onAdd={onAdd} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchInput: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    marginTop: 8,
  },
});
