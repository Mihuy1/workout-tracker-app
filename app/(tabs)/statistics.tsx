import { ThemedText } from "@/components/ui/ThemedText";
import { getWorkoutStats, WorkoutStats } from "@/storage/workoutRepository";
import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const [range, setRange] = useState<Range>(RANGES[0]);
  const [setCount, setSetCount] = useState<number>(0);

  const { data: stats = DEFAULT_STATS } = useQuery({
    queryKey: ["statisticsData", range],
    queryFn: () => getWorkoutStats(db, Date.now() - range.days * 86_400_000),
  });

  function formatDuration(ms: number) {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;

    return `${minutes}m`;
  }

  console.log("statistics:", stats);

  const formattedDuration = formatDuration(stats.totalDuration);
  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Statistics</ThemedText>
      <View style={styles.mainDataView}>
        <View style={styles.mainDataSubView}>
          <ThemedText type="defaultSemiBold">Workouts</ThemedText>
          <ThemedText>{stats.workoutCount}</ThemedText>
          <ThemedText lightColor="#20c74c" darkColor="#20c74c">
            +1
          </ThemedText>
        </View>
        <View style={styles.mainDataSubView}>
          <ThemedText type="defaultSemiBold">Duration</ThemedText>
          <ThemedText>{formattedDuration}</ThemedText>
          <ThemedText lightColor="#20c74c" darkColor="#20c74c">
            +1h 25m
          </ThemedText>
        </View>
        <View style={styles.mainDataSubView}>
          <ThemedText type="defaultSemiBold">Volume</ThemedText>
          <ThemedText>{stats.totalVolume / 1000} kg</ThemedText>
          <ThemedText lightColor="#20c74c" darkColor="#20c74c">
            +35k kg
          </ThemedText>
        </View>
        <View style={styles.mainDataSubView}>
          <ThemedText type="defaultSemiBold">Sets</ThemedText>
          <ThemedText>{stats.totalSets}</ThemedText>
          <ThemedText lightColor="#20c74c" darkColor="#20c74c">
            +25
          </ThemedText>
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
