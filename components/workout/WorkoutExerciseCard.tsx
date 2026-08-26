import { RestTimePicker } from "@/components/timer/RestTimePicker";
import { CustomModal } from "@/components/ui/CustomModal";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ui/ThemedText";
import { useRestTimer } from "@/contexts/restTimerContext";
import { useWorkoutActions } from "@/contexts/workoutActionsContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  Exercise,
  ExercisePrBaseline,
  SetAchievement,
  SetRow,
} from "@/types/workout";
import * as Haptics from "expo-haptics";
import { memo, useState } from "react";
import {
  Button,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

type WorkoutExerciseCardProps = {
  exercise: Exercise;
  prefilledSets?: SetRow[];
  fallbackRestTime?: number;
  prBaseline?: ExercisePrBaseline;
};

export const WorkoutExerciseCard = memo(function WorkoutExerciseCard({
  exercise,
  prefilledSets,
  fallbackRestTime = 120,
  prBaseline,
}: WorkoutExerciseCardProps) {
  const {
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    handleCompleteSet,
    setRestTime,
  } = useWorkoutActions();

  const { triggerRestTimer, clearRestTimer } = useRestTimer();

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

  function calculateSetAchievements(
    prBaseline: ExercisePrBaseline,
    candidateSetId: number,
    sets: SetRow[],
    weightGrams: number,
    reps: number,
  ) {
    if (prBaseline.bestWeightGrams === null) return [];

    let bestWeightGrams = prBaseline.bestWeightGrams;
    let bestRepsAtWeight = prBaseline.bestRepsByWeight[String(weightGrams)];

    for (const set of sets) {
      if (!set.complete || set.id === candidateSetId) continue;

      const setWeightGrams = Math.round(Number(set.weight) * 1000);
      const setReps = Number(set.reps);

      if (!Number.isFinite(setWeightGrams) || !Number.isFinite(setReps))
        continue;

      if (bestWeightGrams === null || bestWeightGrams < setWeightGrams) {
        bestWeightGrams = setWeightGrams;
      }

      if (setWeightGrams === weightGrams) {
        if (bestRepsAtWeight === undefined || bestRepsAtWeight < setReps) {
          bestRepsAtWeight = setReps;
        }
      }
    }

    const achievements: SetAchievement[] = [];

    if (bestWeightGrams !== null && weightGrams > bestWeightGrams) {
      achievements.push({
        type: "new_weight_pr",
        previousBestValue: bestWeightGrams,
        newBestValue: weightGrams,
      });
    }

    if (bestRepsAtWeight !== undefined && reps > bestRepsAtWeight) {
      achievements.push({
        type: "new_reps_pr",
        previousBestValue: bestRepsAtWeight,
        newBestValue: reps,
      });
    }

    return achievements;
  }

  function getSuggestionSet(index: number): SetRow | undefined {
    const historicalSet = prefilledSets?.[index];

    if (historicalSet) return historicalSet;

    for (let previousIndex = index - 1; previousIndex >= 0; previousIndex--) {
      const previousSet = exercise.sets[previousIndex];

      if (
        previousSet?.complete &&
        previousSet.weight !== "" &&
        previousSet.reps !== ""
      )
        return previousSet;
    }
    return undefined;
  }

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

        <Pressable hitSlop={10} onPress={() => setConfirmVisible(true)}>
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
          size={18}
          color={iconColor}
          style={[styles.cell, styles.actionCol]}
        />

        <View style={[styles.cell, styles.actionCol]} />
      </View>

      {exercise.sets.map((item, index) => {
        const suggestedSet = getSuggestionSet(index);
        const suggestedWeight = suggestedSet?.weight ?? "";
        const suggestedReps = suggestedSet?.reps ?? "";
        return (
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
              {index + 1}
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
              placeholder={suggestedWeight || "0"}
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
              placeholder={suggestedReps || "0"}
              placeholderTextColor={placeholderColor}
              keyboardType="numeric"
            />

            <Pressable
              disabled={!prBaseline}
              style={styles.iconButton}
              onPress={() => {
                Keyboard.dismiss();

                const finalWeight =
                  item.weight !== "" ? item.weight : suggestedWeight;

                const finalReps = item.reps !== "" ? item.reps : suggestedReps;

                if (finalReps === "" || finalWeight === "") {
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Warning,
                  );
                  return;
                }

                const willBeCompleted = !item.complete;

                if (!prBaseline) return;

                if (willBeCompleted) {
                  triggerRestTimer(restTime);
                }

                const weightGramsNumber = Math.round(
                  Number(finalWeight) * 1000,
                );

                const achievements: SetAchievement[] = willBeCompleted
                  ? calculateSetAchievements(
                      prBaseline,
                      item.id,
                      exercise.sets,
                      weightGramsNumber,
                      Number(finalReps),
                    )
                  : [];

                if (willBeCompleted) {
                  if (achievements.length > 0) {
                    Haptics.notificationAsync(
                      Haptics.NotificationFeedbackType.Success,
                    );
                  } else {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                } else {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }

                handleCompleteSet(
                  workoutName,
                  item.id,
                  !item.complete,
                  finalWeight,
                  finalReps,
                  achievements,
                );
              }}
            >
              <IconSymbol
                name={
                  !item.complete
                    ? "circle"
                    : item.achievements.length > 0
                      ? "trophy.fill"
                      : "checkmark"
                }
                size={24}
                color={
                  item.achievements.length > 0
                    ? "#D4AF37"
                    : item.complete
                      ? successColor
                      : iconColor
                }
              />
            </Pressable>
            <View style={[styles.cell, styles.actionCol]}>
              <Pressable
                style={styles.iconButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  removeSet(workoutName, item.id);

                  clearRestTimer();
                }}
              >
                <IconSymbol name="minus.circle" size={24} color="red" />
              </Pressable>
            </View>
          </View>
        );
      })}

      <Button
        title="Add Set"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          addSet(workoutName);
        }}
      />
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

  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
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
