import { useWorkout } from "@/app/contexts/workoutContext";
import { Exercise } from "@/app/types/workout";
import { Button, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

type WorkoutProps = {
  workoutName: string;
  workoutMechanic?: string | null;
};

export default function Workout({
  workoutName,
  workoutMechanic,
}: WorkoutProps) {
  const { addExercise } = useWorkout();

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold"> {workoutName} </ThemedText>
      <ThemedText type="default"> {workoutMechanic} </ThemedText>
      <Button
        title="Add Exercise"
        onPress={() =>
          addExercise({
            name: workoutName,
            mechanic: workoutMechanic,
          } as Exercise)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 8,
  },
});
