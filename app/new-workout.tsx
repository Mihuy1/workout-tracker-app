import {
  addCompletedExercise,
  debugPrintCompletedExercises,
  saveCompletedExerciseAsPreset,
} from "@/app/storage/completedExercises";
import { CustomModal } from "@/components/ui/customModal";
import { NewWorkout } from "@/components/ui/newWorkout";
import { usePreventRemove } from "@react-navigation/native";
import {
  router,
  Stack,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "react-native";
import { useWorkout } from "./contexts/workoutContext";

export default function NewWorkoutScreen() {
  const { presetTitle } = useLocalSearchParams<{ presetTitle?: string }>();
  const { exercises, clearWorkout } = useWorkout();
  const navigation = useNavigation();
  const isFinishingRef = useRef(false);

  const startTimeRef = useRef<number>(Date.now());
  const [elapsedTimeMs, setElapsedTimeMs] = useState<number>(0);

  const [discardVisible, setDiscardVisible] = useState(false);

  const [saveWorkoutVisible, setSaveWorkoutVisible] = useState(false);

  const [infoVisible, setInfoVisible] = useState(false);

  const [saveAsPresetVisible, setSaveAsPresetVisible] = useState(false);

  const [updatePresetVisible, setUpdatePresetVisible] = useState(false);

  const pendingNavActionRef = useRef<any>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsedTimeMs(Date.now() - startTimeRef.current);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const finishWorkout = async (presetName: string | null) => {
    isFinishingRef.current = true;

    const workoutDurMs = Date.now() - startTimeRef.current;

    await addCompletedExercise({
      id: Date.now().toString(),
      workoutName: presetName ?? "Workout " + new Date().toLocaleDateString(),
      date: new Date().toISOString(),
      exercises: exercises,
      workoutDurationMs: workoutDurMs,
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
    pendingNavActionRef.current = data.action;
    setDiscardVisible(true);
  });

  const handleCompletePress = () => {
    if (exercises.length === 0) {
      setInfoVisible(true);
      return;
    }

    if (presetTitle) {
      setUpdatePresetVisible(true);
      return;
    }

    setSaveWorkoutVisible(true);

    // if (saveWorkoutVisible) {
    //   setSaveAsPresetVisible(true);
    // }

    // if (exercises.length === 0) {
    //   Alert.alert("Nothing to save", "You can't complete an empty workout.", [
    //     { text: "OK", style: "cancel" },
    //   ]);
    //   return;
    // }
    // Alert.prompt(
    //   "Save Workout",
    //   "Would you like to save this as a preset? Enter name below",
    //   [
    //     {
    //       text: "No",
    //       onPress: () => finishWorkout(null),
    //       style: "cancel",
    //     },
    //     {
    //       text: "Yes",
    //       onPress: (name?: string) => finishWorkout(name || null),
    //     },
    //   ],
    //   "plain-text",
    //   "Leg Day",
    // );

    // if (presetTitle) {
    //   Alert.alert(
    //     "Update Preset?",
    //     "Do you want to update the existing preset with the current exercises?",
    //     [
    //       { text: "No", onPress: () => finishWorkout(null), style: "cancel" },
    //       {
    //         text: "Yes",
    //         onPress: () => finishWorkout(presetTitle || null),
    //       },
    //     ],
    //   );

    //   return;
    // }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: presetTitle ? presetTitle : "New Workout",
          headerBackTitle: "Back",
          headerBackButtonMenuEnabled: false,
          headerRight: () => (
            <Button title="Complete" onPress={handleCompletePress} />
          ),
        }}
      />
      <NewWorkout presetTitle={presetTitle} elapsedTimeMs={elapsedTimeMs} />

      <CustomModal
        visible={discardVisible}
        title="Discard Workout?"
        message="Are you sure you want to discard this workout?"
        primaryButtonText="Yes"
        secondaryButtonText="No"
        onRequestClose={() => setDiscardVisible(false)}
        onPrimary={() => {
          setDiscardVisible(false);
          clearWorkout();

          const action = pendingNavActionRef.current;
          pendingNavActionRef.current = null;
          if (action) navigation.dispatch(action);
        }}
        onSecondary={() => setDiscardVisible(false)}
      />

      <CustomModal
        visible={infoVisible}
        title="Nothing to save"
        message="You can't complete an empty workout."
        primaryButtonText="OK"
        onRequestClose={() => setInfoVisible(false)}
        onPrimary={() => setInfoVisible(false)}
        onSecondary={() => setInfoVisible(false)}
        dismissOnBackdropPress
      />

      <CustomModal
        visible={saveWorkoutVisible}
        title="Save Workout?"
        message="Would you like to save this workout?"
        primaryButtonText="Yes"
        secondaryButtonText="No"
        onRequestClose={() => setSaveWorkoutVisible(false)}
        onSecondary={() => {
          setSaveWorkoutVisible(false);
          isFinishingRef.current = true;
          clearWorkout();
          router.back();
        }}
        onPrimary={() => {
          setSaveWorkoutVisible(false);

          requestAnimationFrame(() => setSaveAsPresetVisible(true));
        }}
      />

      <CustomModal
        visible={saveAsPresetVisible}
        title="Save As Preset?"
        message="Would you like to save this workout as preset?"
        primaryButtonText="Save Preset"
        secondaryButtonText="Skip"
        prompt
        defaultValue="Leg Day"
        placeHolderText="Preset Name"
        onRequestClose={() => setSaveAsPresetVisible(false)}
        onPrimary={(name) => {
          setSaveAsPresetVisible(false);
          finishWorkout(name || null);
        }}
        onSecondary={() => {
          setSaveAsPresetVisible(false);
          finishWorkout(null);
        }}
      />

      <CustomModal
        visible={updatePresetVisible}
        title="Update Workout Preset?"
        message="Would you like to update the preset with your current workout?"
        primaryButtonText="Yes"
        secondaryButtonText="No"
        onRequestClose={() => setUpdatePresetVisible(false)}
        onPrimary={() => {
          setUpdatePresetVisible(false);

          finishWorkout(presetTitle || null);
        }}
        onSecondary={() => {
          setUpdatePresetVisible(false);
          finishWorkout(null);
        }}
      />
    </>
  );
}
