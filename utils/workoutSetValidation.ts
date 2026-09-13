import type { Exercise, SetRow } from "@/types/workout";

// Allow unfinished decimals while typing. Separators always mean decimals,
// so grouped numbers such as "1,000.5" are not accepted.
export const isWeightInput = (value: string): boolean =>
  /^\d*([.,]\d*)?$/.test(value);

export const isRepsInput = (value: string): boolean => /^\d*$/.test(value);

export function parseSetValues(weightText: string, repsText: string) {
  const normalizedWeight = weightText.trim().replace(",", ".");
  const normalizedReps = repsText.trim();

  if (
    !/^(\d+(\.\d*)?|\.\d+)$/.test(normalizedWeight) ||
    !/^\d+$/.test(normalizedReps)
  ) {
    return null;
  }

  const weight = Number(normalizedWeight);
  const reps = Number(normalizedReps);

  if (!Number.isFinite(weight) || !Number.isSafeInteger(reps) || reps <= 0) {
    return null;
  }

  return { weight, reps };
}

export const isValidCompletedSet = (set: SetRow): boolean =>
  set.complete && parseSetValues(set.weight, set.reps) !== null;

export class InvalidCompletedSetError extends Error {}

export function getCompletedExercises(exercises: Exercise[]): Exercise[] {
  return exercises
    .map((exercise) => ({
      ...exercise,
      sets: exercise.sets.flatMap((set, index) => {
        if (!set.complete) return [];

        const values = parseSetValues(set.weight, set.reps);
        if (!values) {
          throw new InvalidCompletedSetError(
            `Check set ${index + 1} of ${exercise.name}. Enter a weight of 0 or more and a whole-number rep count greater than 0.`,
          );
        }

        return [{
          ...set,
          weight: set.weight.trim().replace(",", "."),
          reps: String(values.reps),
        }];
      }),
    }))
    .filter((exercise) => exercise.sets.length > 0);
}
