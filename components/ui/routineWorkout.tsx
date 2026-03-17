import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  PlatformColor,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";
import { CustomButton } from "./customButton";
import { IconSymbol } from "./icon-symbol";

interface routineWorkoutProps {
  item: {
    id: string;
    title: string;
    exercises: any[];
  };
  exercisePreviewText: string;
  setModalVisible: (routineName: string, routineId: string) => void;
}

function RoutineWorkout({
  item,
  exercisePreviewText,
  setModalVisible,
}: routineWorkoutProps) {
  const cardBackground = useThemeColor({}, "surface");
  const cardBorder = useThemeColor({}, "border");
  const buttonBackground = useThemeColor({}, "surfaceMuted");
  const tintColor = useThemeColor({}, "tint");
  const buttonTextColor =
    Platform.OS === "ios" ? PlatformColor("systemBlue") : tintColor;
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardBackground, borderColor: cardBorder },
      ]}
    >
      <View style={styles.topView}>
        <View style={styles.removeView}>
          <Pressable onPress={() => setModalVisible(item.title, item.id)}>
            <IconSymbol name={"x.circle"} size={24} color={"red"} />
          </Pressable>
        </View>

        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
          {item.title}
        </ThemedText>
      </View>

      <ThemedText style={styles.exercisePreviewText} numberOfLines={1}>
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

export default RoutineWorkout;
