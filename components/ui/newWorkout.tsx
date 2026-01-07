import { useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";
import { WorkoutList } from "./workoutList";

export function NewWorkout() {
  const [text, onChangeText] = useState("");
  const [exerciseListVisible, setExerciseListVisible] = useState(false);

  return (
    <View style={styles.container}>
      {exerciseListVisible ? (
        <WorkoutList />
      ) : (
        <>
          <View style={styles.headerRow}>
            <ThemedText type="title">New Workout</ThemedText>
            <Button title="Complete" onPress={() => {}} />
          </View>
          <Button
            title="Add An Exercise"
            onPress={() => {
              setExerciseListVisible(true);
            }}
          />
        </>
      )}
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
