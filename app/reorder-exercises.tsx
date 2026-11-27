import ReorderExercisesList from "@/components/workout/ReorderExercisesList";
import { useWorkoutActions } from "@/contexts/workoutActionsContext";
import { useWorkoutState } from "@/contexts/workoutStateContext";
import { Stack } from "expo-router";

export default function ReorderExercisesScreen() {
  const { exercises } = useWorkoutState();
  const { updateExerciseOrder } = useWorkoutActions();

  return (
    <Stack.Screen options={{ title: "Reorder", headerBackVisible: false }}>
      <ReorderExercisesList
        items={exercises.map((item) => ({
          id: item.exerciseId,
          name: item.name,
        }))}
        onReorder={(ids) => updateExerciseOrder(ids)}
      />
    </Stack.Screen>
  );
}
