import { WorkoutHistoryRow } from "@/components/history/WorkoutHistoryRow";
import { CustomModal } from "@/components/ui/CustomModal";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ThemedText } from "@/components/ui/ThemedText";
import { useWeightUnit } from "@/contexts/weightUnitContext";
import {
  type CompletedWorkout,
  deleteWorkout,
  getWorkoutHistory,
} from "@/storage/workoutRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";

const workoutKeyExtractor = (workout: CompletedWorkout) => workout.id;

export default function TabTwoScreen() {
  const db = useSQLiteContext();
  const { weightUnit } = useWeightUnit();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null,
  );
  const closeDeleteModal = () => setSelectedWorkoutId(null);

  const toggleWorkout = useCallback((id: string) => {
    setExpandedId((currentId) => (currentId === id ? null : id));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CompletedWorkout }) => (
      <WorkoutHistoryRow
        workout={item}
        isExpanded={expandedId === item.id}
        onToggle={toggleWorkout}
        onDelete={setSelectedWorkoutId}
      />
    ),
    [expandedId, toggleWorkout],
  );

  const fetchHistory = async () => {
    try {
      const data = await getWorkoutHistory(db, weightUnit);

      return data;
    } catch (error) {
      console.error("failed to fetch history:", error);
      throw error;
    }
  };

  const { data: historyData = [], isLoading } = useQuery({
    queryKey: ["history", weightUnit],
    queryFn: fetchHistory,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkout(db, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["statisticsData"] });
      setSelectedWorkoutId(null);
    },
    onError: (error) => {
      console.error("Workout deletion failed:", error);
    },
  });

  const handleRemove = async (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading)
    return (
      <ScreenContainer>
        <ThemedText>Loading...</ThemedText>
      </ScreenContainer>
    );

  return (
    <ScreenContainer>
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

      <View>
        <ThemedText type="title">History</ThemedText>
        <FlatList
          data={historyData}
          keyExtractor={workoutKeyExtractor}
          renderItem={renderItem}
          // Workout cards are tall and expansion adds many native views.
          // Keep a smaller offscreen window and mount fewer cards per batch.
          initialNumToRender={5}
          maxToRenderPerBatch={4}
          windowSize={7}
        />
      </View>
    </ScreenContainer>
  );
}
