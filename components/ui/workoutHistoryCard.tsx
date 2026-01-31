import { CompletedWorkout } from "@/app/(tabs)/history";
import { useThemeColor } from "@/hooks/use-theme-color";
import { FlatList, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { ThemedText } from "../themed-text";

type WorkoutHistoryCardProps = {
  exercises: CompletedWorkout["exercises"];
  expandId: string | null;
  itemId: string;
};

export default function WorkoutHistoryCard({
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
    <Animated.View>
      <FlatList
        data={exercises}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item: exercise }) => (
          <View>
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
                <View
                  style={[styles.tableHeader, { borderBottomColor: border }]}
                >
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
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    marginTop: 6,
  },
  exerciseWrapper: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
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
  setCol: { width: 50 },
  kgCol: { width: 140 },
  repsCol: { width: 70 },
  actionCol: { flex: 1, alignItems: "flex-end", paddingRight: 4 },
  staticText: {
    fontSize: 14,
  },
});
