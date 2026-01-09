import { useWorkout } from "@/app/contexts/workoutContext";
import { router } from "expo-router";
import { Button, StyleSheet, View } from "react-native";
import Workout from "./workout";

export function NewWorkout() {
  const { exercises } = useWorkout();

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
