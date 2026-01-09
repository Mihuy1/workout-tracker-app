import { useWorkout } from "@/app/contexts/workoutContext";
import { Exercise } from "@/app/types/workout";
import { router } from "expo-router";
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
  const { addExercise, checkIfExerciseAlreadyAdded } = useWorkout();

  const alreadyAdded = checkIfExerciseAlreadyAdded(workoutName);

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold"> {workoutName} </ThemedText>
      <ThemedText type="default"> {workoutMechanic} </ThemedText>
      {!alreadyAdded && (
        <Button
          title="Add Exercise"
          onPress={() => {
            addExercise({
              name: workoutName,
              mechanic: workoutMechanic,
            } as Exercise);
            router.back();
          }}
        />
      )}
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
