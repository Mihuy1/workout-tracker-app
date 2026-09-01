import { CompletedWorkout } from "@/app/(tabs)/history";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ui/ThemedText";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";

type WorkoutHistoryCardProps = {
  exercises: CompletedWorkout["exercises"];
  expandId: string | null;
  itemId: string;
};

export function WorkoutHistoryCard({
  exercises,
  expandId,
  itemId,
}: WorkoutHistoryCardProps) {
  const isExpanded = expandId === itemId;

  const surfaceMuted = useThemeColor({}, "surfaceMuted");
  const border = useThemeColor({}, "border");
  const mutedText = useThemeColor({}, "mutedText");
  const accent = useThemeColor({}, "tint");
  const rowEven = useThemeColor({}, "surface");

  return (
    <View>
      {exercises.map((exercise, index) => (
        <View key={`${exercise.name}-${index}`}>
          {!isExpanded ? (
            <View>
              <ThemedText type="default" style={styles.summaryRow}>
                {exercise.sets.length} sets of {exercise.name}
              </ThemedText>
            </View>
          ) : (
            <View
              style={[
                styles.exerciseWrapper,
                {
                  backgroundColor: surfaceMuted,
                  borderColor: border,
                },
              ]}
            >
              <ThemedText
                type="defaultSemiBold"
                style={[styles.exerciseName, { color: accent }]}
              >
                {exercise.name}
              </ThemedText>
              <View style={[styles.tableHeader, { borderBottomColor: border }]}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.cell, styles.setCol, { color: mutedText }]}
                >
                  SET
                </ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.cell, styles.kgCol, { color: mutedText }]}
                >
                  WEIGHT & REPS
                </ThemedText>
                <View style={styles.prCol}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: mutedText }}
                  >
                    PR
                  </ThemedText>
                </View>
              </View>

              <View>
                {exercise.sets.map((set, index) => (
                  <View
                    key={set.id}
                    style={[
                      styles.tableRow,
                      { borderColor: border },
                      index % 2 === 0
                        ? { backgroundColor: rowEven }
                        : { backgroundColor: surfaceMuted },
                    ]}
                  >
                    <ThemedText
                      type="default"
                      style={[styles.cell, styles.setCol]}
                    >
                      {index + 1}
                    </ThemedText>
                    <ThemedText
                      type="default"
                      style={[styles.cell, styles.kgCol]}
                    >
                      {set.weight} kg x {set.reps} reps
                    </ThemedText>
                    <View style={styles.prCol}>
                      {set.achievements.length > 0 && (
                        <IconSymbol
                          name="trophy.fill"
                          size={18}
                          color="#f5cc46"
                        />
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    marginTop: 6,
  },
  exerciseWrapper: {
    padding: 10,
  },
  exerciseName: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 2,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cell: {
    paddingHorizontal: 6,
    textAlign: "center",
  },
  setCol: { width: 50, textAlign: "center" },
  kgCol: { flex: 1, textAlign: "left", paddingLeft: 12 },
  repsCol: { width: 70 },
  actionCol: { flex: 1, alignItems: "flex-end", paddingRight: 4 },
  staticText: {
    fontSize: 14,
  },
  prCol: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
