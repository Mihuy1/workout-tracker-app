import { WorkoutHistoryRow } from "@/components/history/WorkoutHistoryRow";
import { CustomModal } from "@/components/ui/CustomModal";
import { ThemedText } from "@/components/ui/ThemedText";
import { useWeightUnit } from "@/contexts/weightUnitContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  type CompletedWorkout,
  deleteWorkout,
  getWorkoutHistory,
} from "@/storage/workoutRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabTwoScreen() {
  const db = useSQLiteContext();
  const { weightUnit } = useWeightUnit();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null,
  );
  const closeDeleteModal = () => setSelectedWorkoutId(null);
  const screenBg = useThemeColor({}, "background");

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
      setSelectedWorkoutId(null);
    },
  });

  const handleRemove = async (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading)
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={{ flex: 1, backgroundColor: screenBg }}
      >
        <ThemedText>Loading...</ThemedText>
      </SafeAreaView>
    );

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: screenBg }}
    >
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
        renderItem={renderItem}
      ></FlatList>
    </SafeAreaView>
  );
}
