import {
  addCompletedExercise,
  debugPrintCompletedExercises,
  getSavedPresetByTitle,
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
  const [isFinishing, setIsFinishing] = useState(false);
  const isFinishingRef = useRef(false);

  const startTimeRef = useRef<number>(Date.now());
  const [elapsedTimeMs, setElapsedTimeMs] = useState<number>(0);

  const [discardVisible, setDiscardVisible] = useState(false);

  const [saveWorkoutVisible, setSaveWorkoutVisible] = useState(false);

  const [infoVisible, setInfoVisible] = useState(false);

  const [saveAsPresetVisible, setSaveAsPresetVisible] = useState(false);

  const [updatePresetVisible, setUpdatePresetVisible] = useState(false);

  const pendingNavActionRef = useRef<any>(null);
  const originalExercisesRef = useRef<any[]>([]);

  useEffect(() => {
    if (presetTitle) {
      getSavedPresetByTitle(presetTitle).then((exercises) => {
        originalExercisesRef.current = exercises || [];
      });
    }
  }, [presetTitle]);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsedTimeMs(Date.now() - startTimeRef.current);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const finishWorkout = async (
    presetName: string | null,
    shouldUpdatePreset: boolean = true,
  ) => {
    setIsFinishing(true);
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

    if (presetName && shouldUpdatePreset) {
      await saveCompletedExerciseAsPreset(exercises, presetName);
    }

    clearWorkout();
    router.back();
  };

  const shouldPreventRemove = exercises.length > 0 && !isFinishing;

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
      const presetExerciseNames = new Set(
        originalExercisesRef.current.map((ex: any) => ex.name),
      );
      const currentExerciseNames = exercises.map((ex) => ex.name);

      const hasNewExercise = currentExerciseNames.some(
        (name) => !presetExerciseNames.has(name),
      );

      if (hasNewExercise) {
        setUpdatePresetVisible(true);
        return;
      } else {
        finishWorkout(presetTitle, false);
        return;
      }
    }

    setSaveWorkoutVisible(true);
  };

  const handleDiscardPress = () => {
    if (exercises.length > 0) {
      setDiscardVisible(true);
    } else {
      router.back();
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: presetTitle ? presetTitle : "New Workout",
          headerLeft: () => (
            <Button title="Discard" onPress={handleDiscardPress} />
          ),
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
        primaryButtonRed={true}
        onRequestClose={() => setDiscardVisible(false)}
        onPrimary={() => {
          setDiscardVisible(false);
          setIsFinishing(true);
          isFinishingRef.current = true;
          clearWorkout();

          const action = pendingNavActionRef.current;
          pendingNavActionRef.current = null;
          if (action) {
            navigation.dispatch(action);
          } else {
            router.back();
          }
        }}
        onSecondary={() => {
          setDiscardVisible(false);
          pendingNavActionRef.current = null;
        }}
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
          finishWorkout(presetTitle || null, false);
        }}
      />
    </>
  );
}
