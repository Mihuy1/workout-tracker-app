import { useWorkout } from "@/app/contexts/workoutContext";
import exercises from "@/app/datasets/exercises.json";
import { useThemeColor } from "@/hooks/use-theme-color";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "../themed-text";
import Workout from "./workout";

export function WorkoutList() {
  const [text, onChangeText] = useState("");
  const { checkIfExerciseAlreadyAdded, getExercises } = useWorkout();
  const workoutExercises = getExercises();
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const surface = useThemeColor({}, "surface");
  const placeholderColor = useThemeColor({}, "placeholder");

  const filtered = useMemo(() => {
    return exercises.filter((item) => !checkIfExerciseAlreadyAdded(item.name));
  }, [workoutExercises]);

  const fuse = useMemo(() => {
    return new Fuse(filtered, {
      keys: [
        { name: "name", weight: 0.7 },
        { name: "primaryMuscles", weight: 0.2 },
        { name: "equipment", weight: 0.1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [filtered]);

  const searchResults = useMemo(() => {
    if (!text) return filtered;

    return fuse.search(text).map((result) => result.item);
  }, [text, fuse, filtered]);

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
          <Workout
            workoutId={item.id}
            workoutName={item.name}
            workoutMechanic={item.mechanic}
          />
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
