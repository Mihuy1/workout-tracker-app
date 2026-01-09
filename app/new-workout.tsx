import { NewWorkout } from "@/components/ui/newWorkout";
import { Stack } from "expo-router";
import { Button } from "react-native";

export default function NewWorkoutScreen() {
  const handleWorkoutComplete = () => {
    // TODO: Implement workout completion logic
  };
  return (
    <>
      <Stack.Screen
        options={{
          title: "New Workout",
          headerBackTitle: "Back",
          headerRight: () => (
            <Button title="Complete" onPress={handleWorkoutComplete} />
          ),
        }}
      />
      <NewWorkout />
    </>
  );
}
