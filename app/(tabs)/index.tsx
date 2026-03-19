import { ThemedText } from "@/components/themed-text";
import { CustomButton } from "@/components/ui/customButton";
import { CustomModal } from "@/components/ui/customModal";
import RoutineWorkout from "@/components/ui/routineWorkout";
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
import {
  getSavedPresets,
  removePresetById,
} from "../storage/completedExercises";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
export default function HomeScreen() {
  const queryClient = useQueryClient();
  const cardBackground = useThemeColor({}, "surface");
  const cardBorder = useThemeColor({}, "border");
  const buttonBackground = useThemeColor({}, "surfaceMuted");
  const tintColor = useThemeColor({}, "tint");
  const buttonTextColor =
    Platform.OS === "ios" ? PlatformColor("systemBlue") : tintColor;
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteRoutineName, setDeleteRoutineName] = useState("");
  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null);

  const fetchPresets = async () => {
    const presets = await getSavedPresets();

    const presetsArray = Object.entries(presets).map(([name, exercises]) => ({
      id: name,
      title: name,
      exercises: exercises as any[],
    }));

    return presetsArray;
  };

  const { data: presets = [], isLoading } = useQuery({
    queryKey: ["presets"],
    queryFn: fetchPresets,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removePresetById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presets"] });
      setModalVisible(false);
    },
  });

  const handleRemovePreset = async (id: string) => {
    // if (id) {
    //   setModalVisible(false);
    //   await removePresetById(id);
    //   setPresets((prev) => prev.filter((preset) => preset.id !== id));
    //   await fetchPresets();
    // }

    if (id) {
      deleteMutation.mutate(id);
    }
  };

  const handleSetModal = async (routineName: string, routineId: string) => {
    console.log("handle set modal");

    setDeleteRoutineName(routineName);
    setDeleteRoutineId(routineId);
    setModalVisible(true);
  };

  if (isLoading)
    return (
      <View style={styles.container}>
        <ThemedText type="title">Loading...</ThemedText>
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
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
            onPress={() => router.push("../new-workout")}
            backgroundColor={buttonBackground}
            textColor={buttonTextColor}
          />
        </View>
        <ThemedText type="title">Your Routines</ThemedText>
        <FlatList
          data={presets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const exerciseNames = item.exercises.map((exercise) =>
              typeof exercise === "string"
                ? exercise
                : exercise?.name || exercise?.title || "Unnamed exercise",
            );

            const previewNames = exerciseNames.slice(0, 3).join(", ");
            const exercisePreviewText =
              exerciseNames.length > 3 ? `${previewNames}...` : previewNames;

            return (
              <RoutineWorkout
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
