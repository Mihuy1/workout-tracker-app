import { CustomModal } from "@/components/ui/CustomModal";
import { ActiveWorkout } from "@/components/workout/ActiveWorkout";
import { useRestTimer } from "@/contexts/restTimerContext";
import { useWeightUnit } from "@/contexts/weightUnitContext";
import { useWorkoutActions } from "@/contexts/workoutActionsContext";
import { useWorkoutState } from "@/contexts/workoutStateContext";
import {
  getRoutine,
  saveRoutine,
  updateRoutine,
} from "@/storage/routineRepository";
import { saveWorkout } from "@/storage/workoutRepository";
import type { Exercise, SetRow } from "@/types/workout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import * as Haptics from "expo-haptics";
import {
  router,
  Stack,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import { useSQLiteContext } from "expo-sqlite";
import { useRef, useState } from "react";
import { Button } from "react-native";

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
  const db = useSQLiteContext();
  const { weightUnit } = useWeightUnit();
  const queryClient = useQueryClient();
  const { presetTitle, routineId } = useLocalSearchParams<{
    presetTitle?: string;
    routineId?: string;
  }>();

  const { exercises } = useWorkoutState();
  const { clearWorkout } = useWorkoutActions();
  const { clearRestTimer } = useRestTimer();
  const navigation = useNavigation();
  const [isFinishing, setIsFinishing] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const finishInFlightRef = useRef(false);
  const exitStartedRef = useRef(false);

  const [startedAt] = useState(() => Date.now());

  const [discardVisible, setDiscardVisible] = useState(false);

  const [saveWorkoutVisible, setSaveWorkoutVisible] = useState(false);

  const [infoVisible, setInfoVisible] = useState(false);

  const [emptySetsVisible, setEmptySetsVisible] = useState(false);

  const [saveErrorVisible, setSaveErrorVisible] = useState(false);

  const [saveAsPresetVisible, setSaveAsPresetVisible] = useState(false);

  const [updatePresetVisible, setUpdatePresetVisible] = useState(false);

  const pendingNavActionRef = useRef<any>(null);

  const openDiscardModal = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setDiscardVisible(true);
  };

  const closeActionModals = () => {
    setDiscardVisible(false);
    setSaveWorkoutVisible(false);
    setSaveAsPresetVisible(false);
    setUpdatePresetVisible(false);
    pendingNavActionRef.current = null;
  };

  const beginExit = () => {
    if (exitStartedRef.current) return;
    exitStartedRef.current = true;
    setIsExiting(true);

    clearWorkout();
    clearRestTimer();

    const action = pendingNavActionRef.current;
    pendingNavActionRef.current = null;
    if (action) {
      navigation.dispatch(action);
    } else {
      router.back();
    }
  };

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

      await saveWorkout(
        db,
        Date.now().toString(),
        presetName ?? "Workout " + new Date().toLocaleDateString(),
        new Date().toISOString(),
        completedExercises,
        workoutDurMs,
        weightUnit,
      );

      if (presetName && shouldUpdatePreset) {
        if (routineId) {
          await updateRoutine(db, {
            id: routineId,
            name: presetName,
            updatedAt: Date.now(),
            exercises: exercises,
          });
        } else {
          await saveRoutine(db, {
            id: Crypto.randomUUID(),
            name: presetName,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            exercises: exercises,
          });
        }
      }

      return true;
    },
    onSuccess: (_data, variables) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      queryClient.invalidateQueries({ queryKey: ["exerciseProgress"] });
      queryClient.invalidateQueries({ queryKey: ["statisticsData"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });

      if (variables.presetName && variables.shouldUpdatePreset) {
        queryClient.invalidateQueries({ queryKey: ["presets"] });
      }

      beginExit();
    },
    onError: (error) => {
      console.error("error finishWorkoutMutation:", error);
      finishInFlightRef.current = false;
      setIsFinishing(false);
      setSaveErrorVisible(true);
    },
  });

  const { data: originalRoutine } = useQuery({
    queryKey: ["routine", routineId],
    queryFn: () => (routineId ? getRoutine(db, routineId) : null),
    enabled: Boolean(routineId),
  });

  const finishWorkout = (
    presetName: string | null,
    shouldUpdatePreset: boolean = true,
  ) => {
    if (finishInFlightRef.current || exitStartedRef.current) return;

    finishInFlightRef.current = true;
    setIsFinishing(true);
    setSaveErrorVisible(false);
    closeActionModals();
    finishWorkoutMutation.mutate({ presetName, shouldUpdatePreset });
  };

  const shouldPreventRemove = exercises.length > 0 && !isExiting;

  usePreventRemove(shouldPreventRemove, ({ data }) => {
    if (finishInFlightRef.current) return;

    pendingNavActionRef.current = data.action;
    openDiscardModal();
  });

  const handleCompletePress = () => {
    if (finishInFlightRef.current || exitStartedRef.current) return;

    if (exercises.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setInfoVisible(true);
      return;
    }

    const hasAnyCompleteSets = exercises.some((ex) =>
      ex.sets.some(isValidCompletedSet),
    );

    if (!hasAnyCompleteSets) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setEmptySetsVisible(true);
      return;
    }

    if (routineId) {
      const originalExercises = originalRoutine?.exercises ?? [];

      const hasRoutineChanged =
        exercises.length !== originalExercises.length ||
        exercises.some((exercise, index) => {
          const original: Exercise | undefined = originalExercises[index];

          if (!original) return true;

          return (
            exercise.exerciseId !== original.exerciseId ||
            exercise.sets.length !== original.sets.length ||
            exercise.restTime !== original.restTime
          );
        });

      if (hasRoutineChanged) {
        setUpdatePresetVisible(true);
        return;
      } else {
        finishWorkout(presetTitle ?? null, false);
        return;
      }
    }

    setSaveWorkoutVisible(true);
  };

  const handleDiscardPress = () => {
    if (finishInFlightRef.current || exitStartedRef.current) return;

    if (exercises.length > 0) {
      openDiscardModal();
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
            <Button
              title="Discard"
              onPress={handleDiscardPress}
              disabled={isFinishing || isExiting}
            />
          ),
          headerBackButtonMenuEnabled: false,
          headerRight: () => (
            <Button
              title="Complete"
              onPress={handleCompletePress}
              disabled={isFinishing || isExiting}
            />
          ),
        }}
      />
      <ActiveWorkout routineId={routineId} startedAt={startedAt} />

      <CustomModal
        visible={discardVisible}
        title="Discard Workout?"
        message="Are you sure you want to discard this workout?"
        primaryButtonText="Yes"
        secondaryButtonText="No"
        primaryButtonRed
        onRequestClose={() => {
          setDiscardVisible(false);
          pendingNavActionRef.current = null;
        }}
        onPrimary={() => {
          setDiscardVisible(false);
          beginExit();
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
        secondaryButtonRed
        onRequestClose={() => setSaveWorkoutVisible(false)}
        onSecondary={() => {
          setSaveWorkoutVisible(false);
          beginExit();
        }}
        onPrimary={() => {
          setSaveWorkoutVisible(false);

          requestAnimationFrame(() => setSaveAsPresetVisible(true));
        }}
      />

      <CustomModal
        visible={saveAsPresetVisible}
        title="Save As Preset"
        message="Would you like to save this workout as preset?"
        primaryButtonText="Save Preset"
        secondaryButtonText="Skip"
        secondaryButtonRed
        prompt
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
        secondaryButtonRed
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
