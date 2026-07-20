import { WorkoutList } from "@/components/ui/workoutList";
import { Stack } from "expo-router";
export default function ExerciseListScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Exercise",
          headerBackTitle: "Back",
          headerRight: () => null,
        }}
      />
      <WorkoutList />
    </>
  );
}
