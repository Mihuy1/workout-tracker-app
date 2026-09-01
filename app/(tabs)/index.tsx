import { ThemedText } from "@/components/ui/ThemedText";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomModal } from "@/components/ui/CustomModal";
import { RoutineCard } from "@/components/routines/RoutineCard";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Platform,
  PlatformColor,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { deleteRoutine, getAllRoutines } from "@/storage/routineRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
export default function HomeScreen() {
  const queryClient = useQueryClient();
  const db = useSQLiteContext();
  const cardBackground = useThemeColor({}, "surface");
  const screenBackground = useThemeColor({}, "background");
  const cardBorder = useThemeColor({}, "border");
  const buttonBackground = useThemeColor({}, "surfaceMuted");
  const tintColor = useThemeColor({}, "tint");
  const buttonTextColor =
    Platform.OS === "ios" ? PlatformColor("systemBlue") : tintColor;
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteRoutineName, setDeleteRoutineName] = useState("");
  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null);

  const fetchPresets = async () => {
    const sqlitePresets = await getAllRoutines(db);

    return sqlitePresets;
  };

  const { data: sqlitePresets = [], isLoading } = useQuery({
    queryKey: ["presets"],
    queryFn: fetchPresets,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRoutine(db, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["presets"] });
      setModalVisible(false);
    },
    onError: (error) => {
      console.error("Failed to delete routine:", error);
      // TODO: Either update currently open modal to show that something went wrong or create new modal and show
    },
  });

  const handleRemovePreset = async (id: string) => {
    if (id) {
      deleteMutation.mutate(id);
    }
  };

  const handleSetModal = async (routineName: string, routineId: string) => {
    setDeleteRoutineName(routineName);
    setDeleteRoutineId(routineId);
    setModalVisible(true);
  };

  if (isLoading)
    return (
      <View
        style={[styles.container, { backgroundColor: screenBackground }]}
      >
        <ThemedText type="title">Loading...</ThemedText>
      </View>
    );

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.container, { backgroundColor: screenBackground }]}
    >
      <CustomModal
        visible={modalVisible}
        title={`Remove ${deleteRoutineName} ?`}
        message="Are you sure you want to remove this routine?"
        primaryButtonText="Yes"
        secondaryButtonText="No"
        onSecondary={() => setModalVisible(false)}
        primaryButtonRed={true}
        onRequestClose={() => setModalVisible(false)}
        onPrimary={() => deleteRoutineId && handleRemovePreset(deleteRoutineId)}
      />

      <View style={styles.content}>
        <ThemedText type="title">Home</ThemedText>
        <View
          style={[
            styles.card,
            { backgroundColor: cardBackground, borderColor: cardBorder },
          ]}
        >
          <CustomButton
            title="Start Empty Workout"
            onPress={() => router.push("/new-workout")}
            backgroundColor={buttonBackground}
            textColor={buttonTextColor}
          />
        </View>
        <ThemedText type="title">Your Routines</ThemedText>
        <FlatList
          data={sqlitePresets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const exerciseNames = item.exercises.map((exercise) =>
              typeof exercise === "string"
                ? exercise
                : exercise?.name || exercise?.name || "Unnamed exercise",
            );

            const previewNames = exerciseNames.slice(0, 3).join(", ");
            const exercisePreviewText =
              exerciseNames.length > 3 ? `${previewNames}...` : previewNames;

            return (
              <RoutineCard
                item={item}
                exercisePreviewText={exercisePreviewText}
                setModalVisible={handleSetModal}
              />
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  content: {
    flex: 1,
    gap: 12,
  },

  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  cardTitle: {
    marginBottom: 10,
  },
  topView: {
    flexDirection: "row-reverse",
  },
  removeView: {
    marginLeft: "auto",
  },
  exercisePreviewText: {
    marginBottom: 12,
  },
  listContent: {
    gap: 10,
    paddingBottom: 16,
  },
});
