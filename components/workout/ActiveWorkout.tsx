import { LiveWorkoutTimer } from "@/components/timer/LiveWorkoutTimer";
import { RestTimer } from "@/components/timer/RestTimer";
import { useWorkoutState } from "@/contexts/workoutStateContext";
import {
  getBaselines,
  getLatestExercisePerformances,
} from "@/storage/workoutRepository";
import { SetRow } from "@/types/workout";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Button, FlatList, StyleSheet, View } from "react-native";
import { WorkoutExerciseCard } from "./WorkoutExerciseCard";

const EMPTY_PREFILLED_SETS: SetRow[] = [];

type ActiveWorkoutProps = {
  routineId?: string | null;
  startedAt: number;
};

export function ActiveWorkout({ routineId, startedAt }: ActiveWorkoutProps) {
  const db = useSQLiteContext();
  const { exercises } = useWorkoutState();
  const exerciseIds = exercises.map((ex) => ex.exerciseId);

  const { data: baselines = {} } = useQuery({
    queryKey: ["baselines", exerciseIds],
    queryFn: () => getBaselines(db, exerciseIds),
    enabled: exerciseIds.length > 0,
  });

  const { data: historyExerciseMap = {} } = useQuery({
    queryKey: ["historyExerciseMap", exerciseIds],
    queryFn: () => getLatestExercisePerformances(db, exerciseIds),
    enabled: exerciseIds.length > 0,
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <LiveWorkoutTimer startedAt={startedAt} />

        <FlatList
          style={styles.exerciseList}
          data={exercises}
          keyExtractor={(item) => item.exerciseId}
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.exerciseListContent}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 5 }}>
              <WorkoutExerciseCard
                exercise={item}
                prefilledSets={
                  historyExerciseMap[item.exerciseId]?.sets ??
                  EMPTY_PREFILLED_SETS
                }
                fallbackRestTime={
                  historyExerciseMap[item.exerciseId]?.restTime ?? 120
                }
                prBaseline={baselines[item.exerciseId]}
              />
            </View>
          )}
        />

        <Button
          title="Add an exercise"
          onPress={() => router.push("/exercise-list")}
        />
      </View>
      <RestTimer />
    </View>
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
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
});
