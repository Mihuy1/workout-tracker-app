import { ExerciseList } from "@/components/exercises/ExerciseList";
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
      <ExerciseList />
    </>
  );
}
