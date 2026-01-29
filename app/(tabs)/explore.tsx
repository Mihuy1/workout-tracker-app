import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import WorkoutHistoryCard from "@/components/ui/workoutHistoryCard";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getCompletedExercises,
  removeCompletedExercise,
} from "../storage/completedExercises";

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

  const handleRemove = async (id: string) => {
    const didRemove = await removeCompletedExercise(id);
    if (!didRemove) return;

    setHistory(didRemove);
    setExpandedId((prev) => (prev === id ? null : prev));
  };

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
                  <View style={styles.removeView}>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation?.();
                        handleRemove(item.id);
                      }}
                    >
                      <IconSymbol name={"x.circle"} size={18} color={"red"} />
                    </Pressable>
                  </View>
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
  removeView: {
    marginLeft: "auto",
    flexDirection: "row",
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
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
});
