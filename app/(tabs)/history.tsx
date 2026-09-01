import { WorkoutHistoryCard } from "@/components/history/WorkoutHistoryCard";
import { WorkoutTimer } from "@/components/timer/WorkoutTimer";
import { CustomModal } from "@/components/ui/CustomModal";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ui/ThemedText";
import { useThemeColor } from "@/hooks/use-theme-color";
import { deleteWorkout, getWorkoutHistory } from "@/storage/workoutRepository";
import { SetRow } from "@/types/workout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
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
        data={historyData}
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
                  <ThemedText type="default" style={styles.title}>
                    {item.workoutName}
                  </ThemedText>
                  <View style={styles.subTitleContainer}>
                    <ThemedText type="default">Duration</ThemedText>
                    <ThemedText type="default">Volume</ThemedText>
                    <ThemedText type="default">Records</ThemedText>
                  </View>
                  <View style={styles.subTextContainer}>
                    <WorkoutTimer elapsedTimeMs={item.workoutDurationMs} />
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

  titleContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  subTitleContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 12,
  },
});
