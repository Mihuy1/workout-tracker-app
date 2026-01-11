import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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
      <View style={styles.container}>
        {history.map((workout) => (
          <View key={workout.id} style={styles.card}>
            <Text style={styles.title}>{workout.workoutName}</Text>
            <Text style={styles.subtitle}>
              {new Date(workout.date).toLocaleString()}
            </Text>

            <Text>{workout.exercises.map((ex) => ex.name).join(", ")}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 12,
  },
  card: {
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
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
