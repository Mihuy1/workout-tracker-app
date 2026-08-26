import { ThemedText } from "@/components/ui/ThemedText";
import { getWorkoutStats, WorkoutStats } from "@/storage/workoutRepository";
import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DeltaProps = {
  value: number;
  formatValue?: (value: number) => string;
  suffix?: string;
};

function Delta({ value, formatValue = String, suffix = "" }: DeltaProps) {
  const color = value > 0 ? "#20c74c" : value < 0 ? "#e05555" : "#888";
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const formattedValue = formatValue(Math.abs(value));

  return (
    <ThemedText lightColor={color} darkColor={color}>
      {sign}
      {formattedValue}
      {suffix ? ` ${suffix}` : ""}
    </ThemedText>
  );
}

const RANGES = [
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
] as const;

type Range = (typeof RANGES)[number];

const DEFAULT_STATS: WorkoutStats = {
  workoutCount: 0,
  totalSets: 0,
  totalDuration: 0,
  totalVolume: 0,
};

export default function Statistics() {
  const db = useSQLiteContext();

  const [range] = useState<Range>(RANGES[0]);

  const { data } = useQuery({
    queryKey: ["statisticsData", range],
    queryFn: async () => {
      const now = Date.now();
      const windowMs = range.days * 86_400_000;

      const [current, previous] = await Promise.all([
        getWorkoutStats(db, now - windowMs, now),
        getWorkoutStats(db, now - 2 * windowMs, now - windowMs),
      ]);

      return { current, previous };
    },
  });

  const stats = data?.current ?? DEFAULT_STATS;
  const previousStats = data?.previous ?? DEFAULT_STATS;

  function formatDuration(ms: number) {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;

    return `${minutes}m`;
  }

  console.log("statistics:", stats);
  console.log("previous stats:", previousStats);

  const formattedDuration = formatDuration(stats.totalDuration);
  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Statistics</ThemedText>
      <View style={styles.mainDataView}>
        <View style={styles.mainDataSubView}>
          <ThemedText type="defaultSemiBold">Workouts</ThemedText>
          <ThemedText>{stats.workoutCount}</ThemedText>
          <Delta value={stats.workoutCount - previousStats.workoutCount} />
        </View>
        <View style={styles.mainDataSubView}>
          <ThemedText type="defaultSemiBold">Duration</ThemedText>
          <ThemedText>{formattedDuration}</ThemedText>
          <Delta
            value={stats.totalDuration - previousStats.totalDuration}
            formatValue={formatDuration}
          />
        </View>
        <View style={styles.mainDataSubView}>
          <ThemedText type="defaultSemiBold">Volume</ThemedText>
          <ThemedText>{stats.totalVolume / 1000} kg</ThemedText>
          <Delta
            value={(stats.totalVolume - previousStats.totalVolume) / 1000}
            suffix="kg"
          />
        </View>
        <View style={styles.mainDataSubView}>
          <ThemedText type="defaultSemiBold">Sets</ThemedText>
          <ThemedText>{stats.totalSets}</ThemedText>
          <Delta value={stats.totalSets - previousStats.totalSets} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  mainDataView: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  mainDataSubView: {
    alignItems: "flex-start",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    width: "48%",
    padding: 10,
  },
});
