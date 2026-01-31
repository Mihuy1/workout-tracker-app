import { CompletedWorkout } from "@/app/(tabs)/history";
import { FlatList, StyleSheet, Text, View } from "react-native";
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

  return (
    <Animated.View>
      <FlatList
        data={exercises}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item: exercise }) => (
          <View>
            {!isExpanded ? (
              <View>
                <Text>
                  {exercise.sets.length} sets of {exercise.name}
                </Text>
              </View>
            ) : (
              <View style={styles.exerciseWrapper}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.tableHeader}>
                  <Text style={[styles.cell, styles.setCol]}>SET</Text>
                  <Text style={[styles.cell, styles.kgCol]}>WEIGHT & REPS</Text>
                </View>

                <View>
                  {exercise.sets.map((set, index) => (
                    <View
                      key={set.id}
                      style={[
                        styles.tableRow,
                        index % 2 === 0 ? styles.evenRow : styles.oddRow,
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
  exerciseWrapper: {
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  exerciseName: {
    fontSize: 16,
    marginBottom: 8,
    color: "#154f8a",
    fontWeight: "600",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#dee2e6",
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e9ecef",
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
  evenRow: {
    backgroundColor: "#ffffff",
  },
  oddRow: {
    backgroundColor: "#e9ecef",
  },
});
