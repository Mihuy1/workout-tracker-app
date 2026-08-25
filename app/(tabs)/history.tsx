import { ThemedText } from "@/components/ui/ThemedText";
import { CustomModal } from "@/components/ui/CustomModal";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { WorkoutHistoryCard } from "@/components/history/WorkoutHistoryCard";
import { WorkoutTimer } from "@/components/timer/WorkoutTimer";
import { useThemeColor } from "@/hooks/use-theme-color";
import { deleteWorkout, getWorkoutHistory } from "@/storage/workoutRepository";
import { SetRow } from "@/types/workout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type CompletedWorkout = {
  id: string;
  workoutName: string;
  date: string;
  workoutDurationMs: number;
  exercises: {
    name: string;
    mechanic: string | null;
    sets: SetRow[];
  }[];
};

export default function TabTwoScreen() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null,
  );
  const closeDeleteModal = () => setSelectedWorkoutId(null);
  const screenBg = useThemeColor({}, "background");
  const cardBg = useThemeColor({}, "surface");
  const cardBorder = useThemeColor({}, "border");
  const shadowColor = "#000";

  const fetchHistory = async () => {
    try {
      const data = await getWorkoutHistory(db);

      return data;
    } catch (error) {
      console.error("failed to fetch history:", error);
      throw error;
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
    mutationFn: (id: string) => deleteWorkout(db, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      setSelectedWorkoutId(null);
    },
  });

  const handleRemove = async (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) return <Text>Loaidng...</Text>;

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
                          setSelectedWorkoutId(item.id);
                        }}
                      >
                        <IconSymbol name={"x.circle"} size={24} color={"red"} />
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
    position: "absolute",
    top: -6,
    right: -6,
    zIndex: 1,
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
    position: "relative",
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
});
