import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import WorkoutHistoryCard from "@/components/ui/workoutHistoryCard";
import { WorkoutTimer } from "@/components/ui/workoutTimer";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getCompletedExercises,
  removeCompletedExercise,
} from "../storage/completedExercises";

export type CompletedWorkout = {
  id: string;
  workoutName: string;
  date: string;
  workoutDurationMs: number;
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

  const screenBg = useThemeColor({}, "background");
  const cardBg = useThemeColor({}, "surface");
  const cardBorder = useThemeColor({}, "border");
  const shadowColor = "#000";

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        const data = await getCompletedExercises();
        if (!cancelled) setHistory(data);
      })();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const handleRemove = async (id: string) => {
    Alert.alert(
      "Delete Workout?",
      "Are you sure you want to delete the workout?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            const didRemove = await removeCompletedExercise(id);
            if (!didRemove) return;

            setHistory(didRemove);
            setExpandedId((prev) => (prev === id ? null : prev));
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: screenBg }}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isExpanded = expandedId === item.id;
          return (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  shadowColor,
                },
              ]}
            >
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
                  <WorkoutTimer elapsedTimeMs={item.workoutDurationMs} />
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
    borderRadius: 12,
    borderWidth: 1,
    // Add shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
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
