import {
  addCompletedExercise,
  debugPrintCompletedExercises,
} from "@/app/storage/completedExercises";
import { NewWorkout } from "@/components/ui/newWorkout";
import { router, Stack } from "expo-router";
import { Button } from "react-native";
import { useWorkout } from "./contexts/workoutContext";

export default function NewWorkoutScreen() {
  const { exercises, clearWorkout } = useWorkout();
  const finishWorkout = async () => {
    await addCompletedExercise({
      id: Date.now().toString(),
      workoutName: "Workout " + new Date().toLocaleDateString(),
      date: new Date().toISOString(),
      exercises: exercises,
    });

    await debugPrintCompletedExercises();

    clearWorkout();
    router.back();
  };
  return (
    <>
      <Stack.Screen
        options={{
          title: "New Workout",
          headerBackTitle: "Back",
          headerRight: () => (
            <Button title="Complete" onPress={finishWorkout} />
          ),
        }}
      />
      <NewWorkout />
    </>
  );
}
