import { useRestTimer } from "@/app/contexts/restTimerContext";
import { useWorkoutActions } from "@/app/contexts/workoutActionsContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Exercise } from "@/types/workout";
import { memo, useState } from "react";
import { Button, Pressable, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "../themed-text";
import { CustomModal } from "./customModal";
import { IconSymbol } from "./icon-symbol";
import { RestTimePicker } from "./restTimePicker";

type WorkoutProps = {
  exercise: Exercise;
  prefilledSets?: Record<string, any>;
  fallbackRestTime?: number;
};

export const Workout = memo(function Workout({
  exercise,
  prefilledSets,
  fallbackRestTime = 120,
}: WorkoutProps) {
  const {
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    handleCompleteSet,
    setRestTime,
  } = useWorkoutActions();

  const { triggerRestTimer } = useRestTimer();

  const { name: workoutName, mechanic: workoutMechanic } = exercise;

  const restTime = exercise?.restTime ?? fallbackRestTime;

  const borderColor = useThemeColor({}, "border");
  const surface = useThemeColor({}, "surface");
  const surfaceMuted = useThemeColor({}, "surfaceMuted");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "placeholder");
  const iconColor = useThemeColor({}, "icon");

  const completedBackground = useThemeColor({}, "completedBackground");
  const completedBorder = useThemeColor({}, "completedBorder");
  const successColor = useThemeColor({}, "success");

  const [confirmVisible, setConfirmVisible] = useState(false);

  return (
    <View style={[styles.container, { borderColor, backgroundColor: surface }]}>
      <CustomModal
        visible={confirmVisible}
        title="Remove Exercise? "
        message={`Are you sure you want to remove "${workoutName}"`}
        primaryButtonText="Yes"
        secondaryButtonText="No"
        primaryButtonRed
        onRequestClose={() => setConfirmVisible(false)}
        onPrimary={() => {
          setConfirmVisible(false);
          removeExercise(workoutName);
        }}
        onSecondary={() => setConfirmVisible(false)}
      />
      <View style={styles.titleRow}>
        <ThemedText type="defaultSemiBold">{workoutName}</ThemedText>

        <Pressable onPress={() => setConfirmVisible(true)}>
          <IconSymbol name="x.circle" size={24} color="red" />
        </Pressable>
      </View>
      <View style={styles.subTitleRow}>
        {!!workoutMechanic && (
          <ThemedText type="default">{workoutMechanic}</ThemedText>
        )}

        <RestTimePicker
          restTime={restTime}
          setRestTime={(t) => setRestTime(workoutName, t)}
        />
      </View>

      {/* <RestTimer duration={restTime} restStartTrigger={restStartTrigger} /> */}
      <View style={[styles.tableHeader, { borderColor }]}>
        <ThemedText type="defaultSemiBold" style={[styles.cell, styles.setCol]}>
          SET
        </ThemedText>
        <ThemedText type="defaultSemiBold" style={[styles.cell, styles.kgCol]}>
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

      {exercise.sets.map((item, index) => (
        <View
          key={item.id}
          style={[
            styles.tableRow,
            { borderColor },
            item.complete
              ? {
                  backgroundColor: completedBackground,
                  borderColor: completedBorder,
                }
              : {
                  backgroundColor: surfaceMuted,
                  borderColor: borderColor,
                },
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
            placeholder={
              prefilledSets && prefilledSets[index]?.weight
                ? String(prefilledSets[index].weight)
                : "0"
            }
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
            placeholder={
              prefilledSets && prefilledSets[index]?.reps
                ? String(prefilledSets[index].reps)
                : "0"
            }
            placeholderTextColor={placeholderColor}
            keyboardType="numeric"
          />

          <Pressable
            onPress={() => {
              const finalWeight =
                item.weight !== ""
                  ? item.weight
                  : prefilledSets && prefilledSets[index]?.weight
                    ? String(prefilledSets[index].weight)
                    : "";

              const finalReps =
                item.reps !== ""
                  ? item.reps
                  : prefilledSets && prefilledSets[index]?.reps
                    ? String(prefilledSets[index].reps)
                    : "";

              if (finalReps === "" || finalWeight === "") {
                console.log("Show popup, returning");
                return;
              }

              const willBeCompleted = !item.complete;

              handleCompleteSet(
                workoutName,
                item.id,
                !item.complete,
                finalWeight,
                finalReps,
              );

              if (willBeCompleted) {
                triggerRestTimer(restTime);
              }
            }}
          >
            <IconSymbol
              name={item.complete ? "checkmark" : "circle"}
              size={18}
              color={item.complete ? successColor : iconColor}
            />
          </Pressable>
          <View style={[styles.cell, styles.actionCol]}>
            <Pressable onPress={() => removeSet(workoutName, item.id)}>
              <IconSymbol name="minus.circle" size={18} color="red" />
            </Pressable>
          </View>
        </View>
      ))}

      <Button title="Add Set" onPress={() => addSet(workoutName)} />
    </View>
  );
});

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

  subTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 6,
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

  notComplete: {
    backgroundColor: "transparent",
  },
});
