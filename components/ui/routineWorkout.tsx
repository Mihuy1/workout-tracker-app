import { useWorkoutActions } from "@/contexts/workoutActionsContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
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
    name: string;
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
  const { clearWorkout, addExercises } = useWorkoutActions();
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
          <Pressable onPress={() => setModalVisible(item.name, item.id)}>
            <IconSymbol name={"x.circle"} size={24} color={"red"} />
          </Pressable>
        </View>

        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
          {item.name}
        </ThemedText>
      </View>

      <ThemedText style={styles.exercisePreviewText} numberOfLines={1}>
        {exercisePreviewText}
      </ThemedText>

      <CustomButton
        title="Start Routine"
        onPress={() => {
          clearWorkout();
          addExercises(item.exercises);
          router.push({
            pathname: "../new-workout",
            params: { presetTitle: item.name, routineId: item.id },
          });
        }}
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
    position: "relative",
    flexDirection: "row",
    paddingRight: 28,
  },
  removeView: {
    position: "absolute",
    top: -6,
    right: -6,
    zIndex: 1,
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
