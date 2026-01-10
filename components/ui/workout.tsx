import { useWorkout } from "@/app/contexts/workoutContext";
import { Exercise } from "@/app/types/workout";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";
import { IconSymbol } from "./icon-symbol";

type WorkoutProps = {
  workoutId?: string;
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
  workoutId,
  workoutName,
  workoutMechanic,
}: WorkoutProps) {
  const { addExercise, checkIfExerciseAlreadyAdded, removeExercise } =
    useWorkout();
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
    patch: Partial<Pick<SetRow, "weight" | "reps" | "complete">>
  ) => {
    setSets((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <ThemedText type="defaultSemiBold">{workoutName}</ThemedText>

        {alreadyAdded && (
          <Pressable onPress={() => removeExercise(workoutName)}>
            <IconSymbol name="x.circle" size={24} color="red" />
          </Pressable>
        )}
      </View>
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
            <IconSymbol
              name="checkmark"
              size={16}
              color="#000"
              style={[styles.cell, styles.actionCol]}
            />

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

                <Pressable
                  onPress={() =>
                    updateSet(item.id, { complete: !item.complete })
                  }
                >
                  <IconSymbol
                    name={item.complete ? "checkmark" : "circle"}
                    size={16}
                    color={item.complete ? "green" : "#000"}
                  />
                </Pressable>
                <View style={[styles.cell, styles.actionCol]}>
                  <Pressable onPress={() => removeSet(item.id)}>
                    <IconSymbol name="minus.circle" size={16} color="red" />
                  </Pressable>
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

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
