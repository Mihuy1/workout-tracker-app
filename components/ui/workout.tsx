import { useWorkout } from "@/app/contexts/workoutContext";
import { Exercise } from "@/app/types/workout";
import { router } from "expo-router";
import React, { useState } from "react";
import { Button, FlatList, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "../themed-text";

type WorkoutProps = {
  workoutName: string;
  workoutMechanic?: string | null;
};

type SetRow = {
  id: number;
  complete: boolean;
  weight: string; // keep as string for TextInput
  reps: string; // keep as string for TextInput
};

export default function Workout({
  workoutName,
  workoutMechanic,
}: WorkoutProps) {
  const { addExercise, checkIfExerciseAlreadyAdded } = useWorkout();
  const alreadyAdded = checkIfExerciseAlreadyAdded(workoutName);

  const [sets, setSets] = useState<SetRow[]>([
    { id: 1, complete: false, weight: "", reps: "" },
  ]);

  const addSet = () => {
    setSets((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((s) => s.id)) + 1 : 1;
      return [...prev, { id: nextId, complete: false, weight: "", reps: "" }];
    });
  };

  const removeSet = (id: number) => {
    setSets((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSet = (
    id: number,
    patch: Partial<Pick<SetRow, "weight" | "reps">>
  ) => {
    setSets((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold">{workoutName}</ThemedText>
      {!!workoutMechanic && (
        <ThemedText type="default">{workoutMechanic}</ThemedText>
      )}

      {alreadyAdded && (
        <>
          <View style={styles.tableHeader}>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.cell, styles.setCol]}
            >
              SET
            </ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.cell, styles.kgCol]}
            >
              KG
            </ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.cell, styles.repsCol]}
            >
              REPS
            </ThemedText>
            <View style={[styles.cell, styles.actionCol]} />
          </View>

          <FlatList
            data={sets}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <ThemedText type="default" style={[styles.cell, styles.setCol]}>
                  {item.id}
                </ThemedText>

                <TextInput
                  style={[styles.input, styles.kgCol]}
                  value={item.weight}
                  onChangeText={(text) => updateSet(item.id, { weight: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />

                <TextInput
                  style={[styles.input, styles.repsCol]}
                  value={item.reps}
                  onChangeText={(text) => updateSet(item.id, { reps: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />

                <View style={[styles.cell, styles.actionCol]}>
                  <Button title="Remove" onPress={() => removeSet(item.id)} />
                </View>
              </View>
            )}
          />

          <Button title="Add Set" onPress={addSet} />
        </>
      )}
      {!alreadyAdded && (
        <Button
          title="Add Exercise"
          onPress={() => {
            addExercise({
              name: workoutName,
              mechanic: workoutMechanic,
            } as Exercise);
            router.back();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 8,
  },

  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#000",
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#999",
  },

  cell: {
    paddingHorizontal: 6,
  },

  setCol: { width: 50 },
  kgCol: { width: 90 },
  repsCol: { width: 90 },
  actionCol: { flex: 1, alignItems: "flex-end" },

  input: {
    height: 36,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    paddingHorizontal: 8,
    marginHorizontal: 6,
  },
});
