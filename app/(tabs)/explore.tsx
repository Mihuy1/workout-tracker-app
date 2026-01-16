import { ThemedText } from "@/components/themed-text";
import WorkoutHistoryCard from "@/components/ui/workoutHistoryCard";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCompletedExercises } from "../storage/completedExercises";

export type CompletedWorkout = {
  id: string;
  workoutName: string;
  date: string;
  exercises: {
    name: string;
    mechanic: string | null;
    sets: {
      id: number;
      complete: boolean;
      weight: string;
      reps: string;
    }[];
  }[];
};

export default function TabTwoScreen() {
  const [history, setHistory] = useState<CompletedWorkout[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  useEffect(() => {
    getCompletedExercises().then(setHistory);
  }, []);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isExpanded = expandedId === item.id;
          return (
            <View style={styles.card}>
              <Pressable
                onPress={() => {
                  if (isExpanded) setExpandedId(null);
                  else setExpandedId(item.id);
                }}
              >
                <View style={styles.titleContainer}>
                  <ThemedText type="default" style={styles.title}>
                    {item.workoutName}
                  </ThemedText>
                </View>
                <WorkoutHistoryCard
                  exercises={item.exercises}
                  expandId={expandedId}
                  itemId={item.id}
                />
              </Pressable>
            </View>
          );
        }}
      ></FlatList>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 12,
  },
  card: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    // Add shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    fontSize: 14,
    color: "#555",
  },
  subtitle: {
    opacity: 0.7,
  },
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "column",
    gap: 4,
    paddingLeft: 12,
  },
});
