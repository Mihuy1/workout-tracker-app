import { useWorkout } from "@/app/contexts/workoutContext";
import { Exercise } from "@/app/types/workout";
import { useThemeColor } from "@/hooks/use-theme-color";
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
import { CustomModal } from "./customModal";
import { IconSymbol } from "./icon-symbol";

type WorkoutProps = {
  workoutId?: string;
  workoutName: string;
  workoutMechanic?: string | null;
};

export default function Workout({
  workoutId,
  workoutName,
  workoutMechanic,
}: WorkoutProps) {
  const {
    exercises,
    addExercise,
    checkIfExerciseAlreadyAdded,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
  } = useWorkout();
  const alreadyAdded = checkIfExerciseAlreadyAdded(workoutName);

  const exercise = exercises.find((ex) => ex.name === workoutName);
  const sets = exercise?.sets ?? [];

  const borderColor = useThemeColor({}, "border");
  const surface = useThemeColor({}, "surface");
  const surfaceMuted = useThemeColor({}, "surfaceMuted");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "placeholder");
  const iconColor = useThemeColor({}, "icon");

  const [confirmVisible, setConfirmVisible] = useState(false);

  return (
    <View style={[styles.container, { borderColor, backgroundColor: surface }]}>
      <CustomModal
        visible={confirmVisible}
        title="Remove Exercise? "
        message={`Are you sure you want to remove "${workoutName}"`}
        primaryButtonText="Yes"
        secondaryButtonText="No"
        onRequestClose={() => setConfirmVisible(false)}
        onPrimary={() => {
          setConfirmVisible(false);
          removeExercise(workoutName);
        }}
        onSecondary={() => setConfirmVisible(false)}
      />
      <View style={styles.titleRow}>
        <ThemedText type="defaultSemiBold">{workoutName}</ThemedText>

        {alreadyAdded && (
          <Pressable onPress={() => setConfirmVisible(true)}>
            <IconSymbol name="x.circle" size={24} color="red" />
          </Pressable>
        )}
      </View>
      {!!workoutMechanic && (
        <ThemedText type="default">{workoutMechanic}</ThemedText>
      )}

      {alreadyAdded && (
        <>
          <View style={[styles.tableHeader, { borderColor }]}>
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
              color={iconColor}
              style={[styles.cell, styles.actionCol]}
            />

            <View style={[styles.cell, styles.actionCol]} />
          </View>

          <FlatList
            data={sets}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.tableRow,
                  { borderColor },
                  item.complete
                    ? styles.complete
                    : [styles.notComplete, { backgroundColor: surfaceMuted }],
                ]}
              >
                <ThemedText type="default" style={[styles.cell, styles.setCol]}>
                  {item.id}
                </ThemedText>

                <TextInput
                  style={[
                    styles.input,
                    styles.kgCol,
                    { borderColor, color: textColor, backgroundColor: surface },
                  ]}
                  value={item.weight}
                  onChangeText={(text) =>
                    updateSet(workoutName, item.id, {
                      weight: text,
                      reps: item.reps,
                      complete: item.complete,
                    })
                  }
                  placeholder="0"
                  placeholderTextColor={placeholderColor}
                  keyboardType="numeric"
                />

                <TextInput
                  style={[
                    styles.input,
                    styles.repsCol,
                    { borderColor, color: textColor, backgroundColor: surface },
                  ]}
                  value={item.reps}
                  onChangeText={(text) =>
                    updateSet(workoutName, item.id, {
                      weight: item.weight,
                      reps: text,
                      complete: item.complete,
                    })
                  }
                  placeholder="0"
                  placeholderTextColor={placeholderColor}
                  keyboardType="numeric"
                />

                <Pressable
                  onPress={() =>
                    updateSet(workoutName, item.id, {
                      weight: item.weight,
                      reps: item.reps,
                      complete: !item.complete,
                    })
                  }
                >
                  <IconSymbol
                    name={item.complete ? "checkmark" : "circle"}
                    size={16}
                    color={item.complete ? "green" : iconColor}
                  />
                </Pressable>
                <View style={[styles.cell, styles.actionCol]}>
                  <Pressable onPress={() => removeSet(workoutName, item.id)}>
                    <IconSymbol name="minus.circle" size={16} color="red" />
                  </Pressable>
                </View>
              </View>
            )}
          />

          <Button title="Add Set" onPress={() => addSet(workoutName)} />
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
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    borderRadius: 6,
    paddingHorizontal: 8,
    marginHorizontal: 6,
  },

  complete: {
    backgroundColor: "#42f55d",
  },

  notComplete: {
    backgroundColor: "transparent",
  },
});
