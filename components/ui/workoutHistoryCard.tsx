import { CompletedWorkout } from "@/app/(tabs)/explore";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ThemedText } from "../themed-text";

type WorkoutHistoryCardProps = {
  exercises: CompletedWorkout["exercises"];
};

export default function WorkoutHistoryCard({
  exercises,
}: WorkoutHistoryCardProps) {
  // renderItem for the Exercise list
  const renderExercise = ({
    item: exercise,
  }: {
    item: CompletedWorkout["exercises"][0];
  }) => (
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
            <ThemedText type="default" style={[styles.cell, styles.setCol]}>
              {index + 1}
            </ThemedText>
            <ThemedText type="default" style={[styles.cell, styles.kgCol]}>
              {set.weight} kg x {set.reps} reps
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <FlatList
      data={exercises}
      keyExtractor={(item, index) => item.name + index}
      renderItem={renderExercise}
      scrollEnabled={false} // Disable to avoid nested scroll issues
    />
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
