import { ThemedText } from "@/components/themed-text";
import { CustomModal } from "@/components/ui/customModal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import WorkoutHistoryCard from "@/components/ui/workoutHistoryCard";
import { WorkoutTimer } from "@/components/ui/workoutTimer";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
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
  const queryClient = useQueryClient();
  // const [history, setHistory] = useState<CompletedWorkout[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null,
  );
  // const openDeleteModal = (id: string) => setSelectedWorkoutId(id);
  const closeDeleteModal = () => setSelectedWorkoutId(null);
  const screenBg = useThemeColor({}, "background");
  const cardBg = useThemeColor({}, "surface");
  const cardBorder = useThemeColor({}, "border");
  const dangerColor = useThemeColor({}, "danger");
  const shadowColor = "#000";

  const fetchHistory = async () => {
    try {
      const data = await getCompletedExercises();

      return data;
    } catch (error) {
      console.error("failed to fetch history:", error);
    }
  };

  const { data: historyData = [], isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: fetchHistory,
  });

  const orderedHistory = useMemo(
    () =>
      [...historyData].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [historyData],
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeCompletedExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      setSelectedWorkoutId(null);
    },
  });

  const handleRemove = async (id: string) => {
    // const didRemove = await removeCompletedExercise(id);

    // console.log("DidRemove:", didRemove);

    // if (!didRemove) return;

    // setSelectedWorkoutId(null);
    // setHistory(didRemove);
    deleteMutation.mutate(id);
    // setExpandedId((prev) => (prev === id ? null : prev));
  };

  if (isLoading)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: screenBg }}>
        <ThemedText type="title">Loading...</ThemedText>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: screenBg }}>
      <CustomModal
        visible={selectedWorkoutId !== null}
        title="Delete Workout?"
        message="Are you sure you want to delete this workout?"
        onRequestClose={closeDeleteModal}
        onSecondary={closeDeleteModal}
        primaryButtonText="Yes"
        secondaryButtonText="No"
        primaryButtonRed
        onPrimary={() => {
          if (selectedWorkoutId) handleRemove(selectedWorkoutId);
        }}
      />

      <FlatList
        data={orderedHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isExpanded = expandedId === item.id;
          return (
            <>
              <Animated.View
                layout={LinearTransition.duration(220)}
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
                          setSelectedWorkoutId(item.id);
                        }}
                      >
                        <IconSymbol
                          name={"x.circle"}
                          size={18}
                          color={dangerColor}
                        />
                      </Pressable>
                    </View>
                  </View>
                  <WorkoutHistoryCard
                    exercises={item.exercises}
                    expandId={expandedId}
                    itemId={item.id}
                  />
                </Pressable>
              </Animated.View>
            </>
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
    paddingVertical: 4,
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
