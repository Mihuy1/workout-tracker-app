import { useWeightUnit } from "@/contexts/weightUnitContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { CompletedWorkout } from "@/storage/workoutRepository";
import { formatWeight } from "@/utils/weightUnits";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { WorkoutTimer } from "../timer/WorkoutTimer";
import { IconSymbol } from "../ui/IconSymbol";
import { ThemedText } from "../ui/ThemedText";
import { WorkoutHistoryCard } from "./WorkoutHistoryCard";

type WorkoutHistoryRowProps = {
  workout: CompletedWorkout;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export const WorkoutHistoryRow = memo(function WorkoutHistoryRow({
  workout,
  isExpanded,
  onToggle,
  onDelete,
}: WorkoutHistoryRowProps) {
  const { weightUnit } = useWeightUnit();

  const cardBg = useThemeColor({}, "surface");
  const cardBorder = useThemeColor({}, "border");
  const shadowColor = "#000";
  return (
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
      <Pressable onPress={() => onToggle(workout.id)}>
        <View style={styles.titleContainer}>
          <View style={styles.removeView}>
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onDelete(workout.id);
              }}
            >
              <IconSymbol name={"x.circle"} size={24} color={"red"} />
            </Pressable>
          </View>
        </View>
        <ThemedText type="default" style={styles.title}>
          {workout.workoutName}
        </ThemedText>
        <View style={styles.statsRow}>
          <View style={styles.statColumn}>
            <ThemedText type="small">Duration</ThemedText>
            <WorkoutTimer elapsedTimeMs={workout.workoutDurationMs} />
          </View>

          <View style={styles.statColumn}>
            <ThemedText type="small">Volume</ThemedText>
            <ThemedText>
              {formatWeight(workout.totalVolumeGrams, weightUnit)}
            </ThemedText>
          </View>

          {workout.prCount > 0 && (
            <View style={styles.statColumn}>
              <ThemedText type="small">Records</ThemedText>
              <View style={styles.recordContainer}>
                <IconSymbol name="trophy.fill" color="#f5cc46" size={18} />
                <ThemedText>{workout.prCount}</ThemedText>
              </View>
            </View>
          )}
        </View>
        <View style={[styles.separator, { backgroundColor: cardBorder }]} />
        <WorkoutHistoryCard
          exercises={workout.exercises}
          isExpanded={isExpanded}
        />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
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
  titleContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  recordContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statsRow: {
    flexDirection: "row",
    columnGap: 28,
    alignItems: "flex-start",
  },
  statColumn: {
    minWidth: 72,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
});
