import { Exercise } from "@/types/workout";
import type { SQLiteDatabase } from "expo-sqlite";

type HistoryRow = {
  workout_id: string;
  workout_name: string;
  completed_at: number;
  duration_ms: number;

  workout_exercise_id: number | null;
  exercise_id: string | null;
  exercise_name: string | null;
  mechanic: string | null;
  exercise_position: number | null;

  set_id: number | null;
  set_number: number | null;
  weight_grams: number | null;
  reps: number | null;
};

export async function getWorkoutHistory(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<HistoryRow>(
    `

    SELECT
      w.id as workout_id,
      w.name as workout_name,
      w.completed_at,
      w.duration_ms,

      we.id as workout_exercise_id,
      we.exercise_id,
      we.exercise_name,
      we.mechanic,
      we.position as exercise_position,

      ws.id as set_id,
      ws.set_number,
      ws.weight_grams,
      ws.reps

    FROM workouts w

    LEFT JOIN workout_exercises we
      ON we.workout_id = w.id

    LEFT JOIN workout_sets ws
      ON ws.workout_exercise_id = we.id

    ORDER BY
      w.completed_at DESC,
      we.position ASC,
      ws.set_number ASC

    `,
  );

  const workouts = new Map<string, any>();
  const exerciseRows = new Map<number, any>();

  for (const row of rows) {
    let workout = workouts.get(row.workout_id);

    if (!workout) {
      workout = {
        id: row.workout_id,
        workoutName: row.workout_name,
        date: new Date(row.completed_at).toISOString(),
        workoutDurationMs: row.duration_ms,
        exercises: [],
      };

      workouts.set(row.workout_id, workout);
    }

    if (
      row.workout_exercise_id === null ||
      row.exercise_id === null ||
      row.exercise_name === null
    )
      continue;

    let exercise = exerciseRows.get(row.workout_exercise_id);

    if (!exercise) {
      exercise = {
        exerciseId: row.exercise_id,
        name: row.exercise_name,
        mechanic: row.mechanic,
        sets: [],
      };

      exerciseRows.set(row.workout_exercise_id, exercise);
      workout.exercises.push(exercise);
    }

    if (
      row.set_id !== null &&
      row.set_number !== null &&
      row.weight_grams !== null &&
      row.reps !== null
    ) {
      exercise.sets.push({
        id: row.set_id,
        complete: true,
        weight: String(row.weight_grams / 1000),
        reps: String(row.reps),
      });
    }
  }

  return Array.from(workouts.values());
}

export async function saveWorkout(
  db: SQLiteDatabase,
  id: string,
  workoutName: string,
  date: string,
  exercises: Exercise[],
  workoutDurationMs: number,
) {
  const completedAt = new Date(date).getTime();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `
        INSERT INTO workouts (
        id,
        name,
        completed_at,
        duration_ms
        )
        VALUES (?, ?, ?, ?)
        `,
      [id, workoutName, completedAt, workoutDurationMs],
    );
    for (const [exercisePosition, exercise] of exercises.entries()) {
      const exerciseResult = await db.runAsync(
        `
            INSERT INTO workout_exercises (
            workout_id,
            exercise_id,
            exercise_name,
            mechanic,
            rest_seconds,
            position
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
        [
          id,
          exercise.exerciseId,
          exercise.name,
          exercise.mechanic ?? null,
          exercise.restTime,
          exercisePosition,
        ],
      );
      const workoutExerciseId = exerciseResult.lastInsertRowId;

      for (const [setPosition, set] of exercise.sets.entries()) {
        const weightGrams = Math.round(Number(set.weight) * 1000);

        await db.runAsync(
          `
            INSERT INTO workout_sets (
              workout_exercise_id,
              set_number,
              weight_grams,
              reps
            )
            VALUES (?, ?, ?, ?)
            `,
          [workoutExerciseId, setPosition + 1, weightGrams, Number(set.reps)],
        );
      }
    }
  });
}

export async function deleteWorkout(db: SQLiteDatabase, id: string) {
  return db.runAsync(`DELETE FROM workouts WHERE id = $value`, { $value: id });
}
