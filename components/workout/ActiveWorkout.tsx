import { LiveWorkoutTimer } from "@/components/timer/LiveWorkoutTimer";
import { RestTimer } from "@/components/timer/RestTimer";
import { CustomButton } from "@/components/ui/CustomButton";
import { ThemedView } from "@/components/ui/ThemedView";
import { useDefaultRestTime } from "@/contexts/restTimePreferenceContext";
import { useRestTimer } from "@/contexts/restTimerContext";
import { useWeightUnit } from "@/contexts/weightUnitContext";
import { useWorkoutState } from "@/contexts/workoutStateContext";
import {
  getBaselines,
  getLatestExercisePerformances,
} from "@/storage/workoutRepository";
import { SetRow } from "@/types/workout";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { FlatList, StyleSheet, View, type ScrollViewProps } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WorkoutExerciseCard } from "./WorkoutExerciseCard";

const EMPTY_PREFILLED_SETS: SetRow[] = [];

// Defined at module level so FlatList gets the same component on every render.
const renderScrollComponent = (props: ScrollViewProps) => (
  <KeyboardAwareScrollView {...props} bottomOffset={24} />
);

type ActiveWorkoutProps = {
  routineId?: string | null;
  startedAt: number;
};

export function ActiveWorkout({ routineId, startedAt }: ActiveWorkoutProps) {
  const db = useSQLiteContext();
  const { exercises } = useWorkoutState();
  const { weightUnit } = useWeightUnit();
  const { defaultRestTime } = useDefaultRestTime();
  const { restTimerRun } = useRestTimer();
  const insets = useSafeAreaInsets();
  const exerciseIds = exercises.map((ex) => ex.exerciseId);

  const { data: baselines = {} } = useQuery({
    queryKey: ["baselines", exerciseIds],
    queryFn: () => getBaselines(db, exerciseIds),
    enabled: exerciseIds.length > 0,
  });

  const { data: historyExerciseMap = {} } = useQuery({
    queryKey: ["historyExerciseMap", exerciseIds, weightUnit],
    queryFn: () => getLatestExercisePerformances(db, exerciseIds, weightUnit),
    enabled: exerciseIds.length > 0,
  });

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.content,
          // The rest timer pads for the bottom inset itself when it is shown.
          !restTimerRun && { paddingBottom: Math.max(10, insets.bottom) },
        ]}
      >
        <LiveWorkoutTimer startedAt={startedAt} />

        <FlatList
          style={styles.exerciseList}
          data={exercises}
          keyExtractor={(item) => item.exerciseId}
          renderScrollComponent={renderScrollComponent}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.exerciseListContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 5 }}>
              <WorkoutExerciseCard
                exercise={item}
                prefilledSets={
                  historyExerciseMap[item.exerciseId]?.sets ??
                  EMPTY_PREFILLED_SETS
                }
                fallbackRestTime={
                  historyExerciseMap[item.exerciseId]?.restTime ??
                  defaultRestTime
                }
                prBaseline={baselines[item.exerciseId]}
              />
            </View>
          )}
        />

        <CustomButton
          variant="plain"
          title="Add an exercise"
          onPress={() => router.push("/exercise-list")}
        />
      </View>
      <RestTimer />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  exerciseList: {
    flex: 1,
  },
  exerciseListContent: {
    paddingBottom: 200,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
});
