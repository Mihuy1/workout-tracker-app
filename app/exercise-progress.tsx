import { ExerciseProgressChart } from "@/components/exercises/ExerciseProgressChart";
import { ThemedText } from "@/components/ui/ThemedText";
import { getExerciseStats } from "@/storage/workoutRepository";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { StyleSheet, View } from "react-native";

export default function ExerciseProgressScreen() {
  const db = useSQLiteContext();

  const { exerciseId, exerciseName } = useLocalSearchParams<{
    exerciseId: string;
    exerciseName: string;
  }>();

  const { data, isPending, error } = useQuery({
    queryKey: ["exerciseProgress", exerciseId],
    queryFn: () => getExerciseStats(db, exerciseId),
    enabled: Boolean(exerciseId),
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: exerciseName,
          headerBackTitle: "Back",
          headerRight: () => null,
        }}
      />

      <View style={styles.container}>
        {isPending && <ThemedText>Loading exercise data...</ThemedText>}

        {error && <ThemedText>Could not load exercise data.</ThemedText>}

        {data && (
          <ExerciseProgressChart
            heaviestWeight={data.heaviestWeight}
            oneRepMax={data.oneRepMax}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
