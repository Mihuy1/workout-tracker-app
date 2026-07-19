import {
  addCompletedExercise,
  getSavedPresetByTitle,
  saveCompletedExerciseAsPreset,
  saveWeightProgressionByExerciseName,
} from "@/app/storage/completedExercises";
import { CustomModal } from "@/components/ui/customModal";
import { NewWorkout } from "@/components/ui/newWorkout";
import type { SetRow } from "@/types/workout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  router,
  Stack,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "react-native";
import { useRestTimer } from "./contexts/restTimerContext";
import { useWorkoutActions } from "./contexts/workoutActionsContext";
import { useWorkoutState } from "./contexts/workoutStateContext";

const isValidCompletedSet = (set: SetRow): boolean => {
  const weight = Number(set.weight);
  const reps = Number(set.reps);

  return (
    set.complete &&
    set.weight.trim() !== "" &&
    set.reps.trim() !== "" &&
    Number.isFinite(weight) &&
    weight >= 0 &&
    Number.isInteger(reps) &&
    reps > 0
  );
};

export default function NewWorkoutScreen() {
  const queryClient = useQueryClient();
  const { presetTitle } = useLocalSearchParams<{ presetTitle?: string }>();
  const { exercises } = useWorkoutState();
  const { clearWorkout } = useWorkoutActions();
  const { clearRestTimer } = useRestTimer();
  const navigation = useNavigation();
  const [isFinishing, setIsFinishing] = useState(false);
  const shouldExitRef = useRef(false);

  const [startedAt] = useState(() => Date.now());

  const [discardVisible, setDiscardVisible] = useState(false);

  const [saveWorkoutVisible, setSaveWorkoutVisible] = useState(false);

  const [infoVisible, setInfoVisible] = useState(false);

  const [emptySetsVisible, setEmptySetsVisible] = useState(false);

  const [saveErrorVisible, setSaveErrorVisible] = useState(false);

  const [saveAsPresetVisible, setSaveAsPresetVisible] = useState(false);

  const [updatePresetVisible, setUpdatePresetVisible] = useState(false);

  const pendingNavActionRef = useRef<any>(null);
  const originalExercisesRef = useRef<any[]>([]);

  const finishWorkoutMutation = useMutation({
    mutationFn: async ({
      presetName,
      shouldUpdatePreset,
    }: {
      presetName: string | null;
      shouldUpdatePreset: boolean;
    }) => {
      const workoutDurMs = Date.now() - startedAt;
      const completedExercises = exercises
        .map((exercise) => ({
          ...exercise,
          sets: exercise.sets.filter(isValidCompletedSet),
        }))
        .filter((exercise) => exercise.sets.length > 0);

      await addCompletedExercise({
        id: Date.now().toString(),
        workoutName: presetName ?? "Workout " + new Date().toLocaleDateString(),
        date: new Date().toISOString(),
        exercises: completedExercises,
        workoutDurationMs: workoutDurMs,
      });

      const weightsPerExercise = completedExercises.map((exercise) => ({
        exerciseName: exercise.name,
        weight: exercise.sets.map((set) => set.weight),
      }));

      console.log("weightsPerExercise:", weightsPerExercise);

      for (const exercise of weightsPerExercise) {
        await saveWeightProgressionByExerciseName(
          exercise.exerciseName,
          exercise.weight,
        );
      }

      if (presetName && shouldUpdatePreset) {
        await saveCompletedExerciseAsPreset(exercises, presetName);
      }

      return true;
    },
    onSuccess: (didChangePresets) => {
      if (didChangePresets) {
        console.log("This got called!");
        queryClient.invalidateQueries({ queryKey: ["presets"] });
        queryClient.invalidateQueries({ queryKey: ["history"] });
      }

      clearWorkout();
      clearRestTimer();
      router.back();
    },
    onError: (error) => {
      console.error("error finishWorkoutMutation:", error);
      setIsFinishing(false);
      setSaveErrorVisible(true);
    },
  });

  useEffect(() => {
    if (!isFinishing || !shouldExitRef.current) return;

    shouldExitRef.current = false;
    clearWorkout();
    clearRestTimer();

    const action = pendingNavActionRef.current;
    pendingNavActionRef.current = null;
    if (action) {
      navigation.dispatch(action);
    } else {
      router.back();
    }
  }, [isFinishing, clearWorkout, clearRestTimer, navigation]);

  useEffect(() => {
    if (presetTitle) {
      getSavedPresetByTitle(presetTitle).then((exercises) => {
        originalExercisesRef.current = exercises || [];
      });
    }
  }, [presetTitle]);

  const finishWorkout = async (
    presetName: string | null,
    shouldUpdatePreset: boolean = true,
  ) => {
    setIsFinishing(true);
    finishWorkoutMutation.mutate({ presetName, shouldUpdatePreset });
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

    const hasAnyCompleteSets = exercises.some((ex) =>
      ex.sets.some(isValidCompletedSet),
    );

    if (!hasAnyCompleteSets) {
      setEmptySetsVisible(true);
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
          gestureEnabled: !shouldPreventRemove,
          headerLeft: () => (
            <Button title="Discard" onPress={handleDiscardPress} />
          ),
          headerBackButtonMenuEnabled: false,
          headerRight: () => (
            <Button title="Complete" onPress={handleCompletePress} />
          ),
        }}
      />
      <NewWorkout presetTitle={presetTitle} startedAt={startedAt} />

      <CustomModal
        visible={discardVisible}
        title="Discard Workout?"
        message="Are you sure you want to discard this workout?"
        primaryButtonText="Yes"
        secondaryButtonText="No"
        onRequestClose={() => {
          setDiscardVisible(false);
          pendingNavActionRef.current = null;
        }}
        onPrimary={() => {
          setDiscardVisible(false);
          setIsFinishing(true);
          shouldExitRef.current = true;
        }}
        onSecondary={() => {
          setDiscardVisible(false);
          pendingNavActionRef.current = null;
        }}
      />

      <CustomModal
        visible={emptySetsVisible}
        title="No completed sets"
        message="Complete at least one set with a weight and rep count before saving. Incomplete sets will not be added to history."
        primaryButtonText="OK"
        onRequestClose={() => setEmptySetsVisible(false)}
        onPrimary={() => setEmptySetsVisible(false)}
        onSecondary={() => setEmptySetsVisible(false)}
        dismissOnBackdropPress
      />

      <CustomModal
        visible={saveErrorVisible}
        title="Workout not saved"
        message="Your workout could not be saved. It is still open, so you can try again."
        primaryButtonText="OK"
        onRequestClose={() => setSaveErrorVisible(false)}
        onPrimary={() => setSaveErrorVisible(false)}
        dismissOnBackdropPress
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
          setIsFinishing(true);

          shouldExitRef.current = true;
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
