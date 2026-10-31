import CustomDropdown from "@/components/CustomDropdown";
import { ExerciseProgressChart } from "@/components/exercises/ExerciseProgressChart";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { useWeightUnit } from "@/contexts/weightUnitContext";
import { getExerciseStats } from "@/storage/workoutRepository";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Range, RANGES } from "./(tabs)/statistics";

export default function ExerciseProgressScreen() {
  const db = useSQLiteContext();
  const { weightUnit } = useWeightUnit();

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const { exerciseId, exerciseName, days } = useLocalSearchParams<{
    exerciseId: string;
    exerciseName: string;
    days: string;
  }>();

  const [range, setRange] = useState<Range>(
    () => RANGES.find((r) => r.value === Number(days)) ?? RANGES[0],
  );

  const { data, isPending, error } = useQuery({
    queryKey: ["exerciseProgress", exerciseId, weightUnit, range.value],
    queryFn: () =>
      getExerciseStats(db, exerciseId, weightUnit, Number(range.value)),
    enabled: Boolean(exerciseId),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: exerciseName,
          headerBackTitle: "Back",
          headerRight: () => null,
          gestureEnabled: false,
        }}
      />

      <ThemedView style={styles.container}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
        >
          {isPending && <ThemedText>Loading exercise data...</ThemedText>}

          {error && <ThemedText>Could not load exercise data.</ThemedText>}

          <CustomDropdown
            options={RANGES}
            value={range.value}
            open={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
            onSelect={(option) => {
              const next = RANGES.find((r) => r.value === option);
              if (next) setRange(next);
            }}
            fullWidth
            centerText
          />

          {data && (
            <View style={{ paddingTop: 15 }}>
              <ExerciseProgressChart
                key={range.value}
                exerciseName={exerciseName}
                heaviestWeight={data.heaviestWeight}
                oneRepMax={data.oneRepMax}
              />
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
});
