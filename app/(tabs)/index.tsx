import { ThemedText } from "@/components/themed-text";
import { CustomButton } from "@/components/ui/customButton";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  PlatformColor,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getSavedPresets } from "../storage/completedExercises";

export default function HomeScreen() {
  const [presets, setPresets] = useState<
    { id: string; title: string; exercises: any[] }[]
  >([]);
  const cardBackground = useThemeColor({}, "surface");
  const cardBorder = useThemeColor({}, "border");
  const buttonBackground = useThemeColor({}, "surfaceMuted");
  const tintColor = useThemeColor({}, "tint");
  const buttonTextColor =
    Platform.OS === "ios" ? PlatformColor("systemBlue") : tintColor;

  const fetchPresets = async () => {
    const presets = await getSavedPresets();

    const presetsArray = Object.entries(presets).map(([name, exercises]) => ({
      id: name,
      title: name,
      exercises: exercises as any[],
    }));

    setPresets(presetsArray);
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
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
              <View
                style={[
                  styles.card,
                  { backgroundColor: cardBackground, borderColor: cardBorder },
                ]}
              >
                <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                  {item.title}
                </ThemedText>

                <ThemedText
                  style={styles.exercisePreviewText}
                  numberOfLines={1}
                >
                  {exercisePreviewText}
                </ThemedText>

                <CustomButton
                  title="Start Routine"
                  onPress={() =>
                    router.push({
                      pathname: "../new-workout",
                      params: { presetTitle: item.title },
                    })
                  }
                  backgroundColor={buttonBackground}
                  textColor={buttonTextColor}
                />
              </View>
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
  exercisePreviewText: {
    marginBottom: 12,
  },
  listContent: {
    gap: 10,
    paddingBottom: 16,
  },
});
