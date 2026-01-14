import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCompletedExercises } from "../storage/completedExercises";

type CompletedWorkout = {
  id: string;
  workoutName: string;
  date: string;
  exercises: {
    name: string;
    mechanic: string | null;
    sets: {
      id: number;
      complete: boolean;
      weight: string;
      reps: string;
    }[];
  }[];
};

export default function TabTwoScreen() {
  const [history, setHistory] = useState<CompletedWorkout[]>([]);

  useEffect(() => {
    getCompletedExercises().then(setHistory);
  }, []);
  return (
    <SafeAreaView>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => null}>
            <Text style={styles.title}>{item.workoutName}</Text>

            {item.exercises.map((exercise, index) => (
              <Text key={index} style={styles.row}>
                {exercise.name} - {exercise.sets.length} sets
              </Text>
            ))}
          </Pressable>
        )}
      ></FlatList>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 12,
  },
  card: {
    paddingVertical: 12,
    paddingHorizontal: 12,

    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  row: {
    fontSize: 14,
    color: "#555",
  },
  subtitle: {
    opacity: 0.7,
  },
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
