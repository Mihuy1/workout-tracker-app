import {
  addCompletedExercise,
  debugPrintCompletedExercises,
} from "@/app/storage/completedExercises";
import { NewWorkout } from "@/components/ui/newWorkout";
import { usePreventRemove } from "@react-navigation/native";
import { router, Stack, useNavigation } from "expo-router";
import { useRef } from "react";
import { Alert, Button } from "react-native";
import { useWorkout } from "./contexts/workoutContext";

export default function NewWorkoutScreen() {
  const { exercises, clearWorkout } = useWorkout();
  const navigation = useNavigation();
  const isFinishingRef = useRef(false);
  const finishWorkout = async () => {
    isFinishingRef.current = true;
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

  const shouldPreventRemove = exercises.length > 0 && !isFinishingRef.current;

  usePreventRemove(shouldPreventRemove, ({ data }) => {
    const action = data.action;
    Alert.alert(
      "Discard workout?",
      "Are you sure you want to discard this workout?",
      [
        { text: "Cancel", style: "cancel", onPress: () => {} },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            clearWorkout();
            navigation.dispatch(action); // Resume the blocked navigation
          },
        },
      ]
    );
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: "New Workout",
          headerBackTitle: "Back",
          headerBackButtonMenuEnabled: false,
          headerRight: () => (
            <Button title="Complete" onPress={finishWorkout} />
          ),
        }}
      />
      <NewWorkout />
    </>
  );
}
