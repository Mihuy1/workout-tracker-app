import {
  addCompletedExercise,
  debugPrintCompletedExercises,
  saveCompletedExerciseAsPreset,
} from "@/app/storage/completedExercises";
import { NewWorkout } from "@/components/ui/newWorkout";
import Alert from "@blazejkustra/react-native-alert";
import { usePreventRemove } from "@react-navigation/native";
import { router, Stack, useNavigation } from "expo-router";
import { useRef } from "react";
import { Button } from "react-native";
import { useWorkout } from "./contexts/workoutContext";

export default function NewWorkoutScreen() {
  const { exercises, clearWorkout } = useWorkout();
  const navigation = useNavigation();
  const isFinishingRef = useRef(false);
  const finishWorkout = async (presetName: string | null) => {
    isFinishingRef.current = true;

    await addCompletedExercise({
      id: Date.now().toString(),
      workoutName: presetName ?? "Workout " + new Date().toLocaleDateString(),
      date: new Date().toISOString(),
      exercises: exercises,
    });

    await debugPrintCompletedExercises();

    if (presetName) {
      await saveCompletedExerciseAsPreset(exercises, presetName);
    }

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

  const handleCompletePress = () => {
    Alert.prompt(
      "Save Workout",
      "Would you like to save this as preset? Enter name below",
      [
        {
          text: "No",
          onPress: () => finishWorkout(null),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: (name?: string) => finishWorkout(name || null),
        },
      ],
      "plain-text",
      "Leg Day"
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "New Workout",
          headerBackTitle: "Back",
          headerBackButtonMenuEnabled: false,
          headerRight: () => (
            <Button title="Complete" onPress={handleCompletePress} />
          ),
        }}
      />
      <NewWorkout />
    </>
  );
}
