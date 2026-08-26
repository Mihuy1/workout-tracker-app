import { Exercise, ExercisePrBaseline, SetRow } from "@/types/workout";
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

  workout_set_achievement_id: number | null;
  workout_set_id: number | null;
  achievement_type: string | null;
  previous_best: number | null;
  new_best_value: number | null;
};

export type LatestExercisePerformance = {
  exerciseId: string;
  restTime: number;
  sets: SetRow[];
};

type LatestPerformanceRow = {
  exercise_id: string;
  rest_seconds: number;
  set_number: number;
  weight_grams: number;
  reps: number;
};

type ExercisePrBaselineRow = {
  exercise_id: string;
  best_reps: number;
  weight_grams: number;
};

type WorkoutStatsRow = {
  workout_count: number;
  total_sets: number;
  total_duration: number;
  total_volume: number;
};

export type WorkoutStats = {
  workoutCount: number;
  totalSets: number;
  totalDuration: number;
  totalVolume: number;
};

export async function getWorkoutStats(
  db: SQLiteDatabase,
  fromMs?: number,
  toMs?: number,
): Promise<WorkoutStats> {
  const lower = fromMs ?? 0;
  const upper = toMs ?? Number.MAX_SAFE_INTEGER;

  const rows = await db.getFirstAsync<WorkoutStatsRow>(
    `SELECT
      (SELECT COUNT(*)
        FROM workouts
        WHERE completed_at >= ? AND completed_at < ?
      ) AS workout_count,

        (SELECT COUNT(ws.id)
          FROM workout_sets ws
          JOIN workout_exercises we ON we.id = ws.workout_exercise_id
          JOIN workouts w ON w.id = we.workout_id
          WHERE w.completed_at >= ? AND w.completed_at < ?
        ) AS total_sets,

        (SELECT COALESCE(
          SUM(duration_ms), 0) 
          FROM workouts WHERE completed_at >= ? AND completed_at < ?) AS total_duration,

        (SELECT SUM(ws.weight_grams * ws.reps)
          FROM workout_sets ws
          JOIN workout_exercises we ON we.id = ws.workout_exercise_id
          JOIN workouts w ON w.id = we.workout_id
          WHERE w.completed_at >= ? AND w.completed_at < ?
        ) AS total_volume
      `,
    [lower, upper, lower, upper, lower, upper, lower, upper],
  );

  return {
    workoutCount: rows?.workout_count ?? 0,
    totalSets: rows?.total_sets ?? 0,
    totalDuration: rows?.total_duration ?? 0,
    totalVolume: rows?.total_volume ?? 0,
  };
}

export type ExercisePrBaselines = Partial<Record<string, ExercisePrBaseline>>;

export async function getWorkoutHistory(db: SQLiteDatabase, sinceMs?: number) {
  const rows = await db.getAllAsync<HistoryRow>(
    `

    SELECT
      w.id AS workout_id,
      w.name AS workout_name,
      w.completed_at,
      w.duration_ms,

      we.id AS workout_exercise_id,
      we.exercise_id,
      we.exercise_name,
      we.mechanic,
      we.position as exercise_position,

      ws.id AS set_id,
      ws.set_number,
      ws.weight_grams,
      ws.reps,

      wsa.id AS workout_set_achievement_id,
      wsa.workout_set_id,
      wsa.achievement_type,
      wsa.previous_best,
      wsa.new_best_value

    FROM workouts w

    LEFT JOIN workout_exercises we
      ON we.workout_id = w.id

    LEFT JOIN workout_sets ws
      ON ws.workout_exercise_id = we.id

    LEFT JOIN workout_set_achievements wsa
      ON wsa.workout_set_id = ws.id

    WHERE w.completed_at >= ?

    ORDER BY
      w.completed_at DESC,
      we.position ASC,
      ws.set_number ASC

    `,
    [sinceMs ?? 0],
  );

  const workouts = new Map<string, any>();
  const exerciseRows = new Map<number, any>();
  const setRows = new Map<number, SetRow>();

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
      row.set_id === null ||
      row.set_number === null ||
      row.weight_grams === null ||
      row.reps === null
    ) {
      continue;
    }

    let set = setRows.get(row.set_id);

    if (!set) {
      set = {
        id: row.set_number,
        complete: true,
        weight: String(row.weight_grams / 1000),
        reps: String(row.reps),
        achievements: [],
      };

      setRows.set(row.set_id, set);
      exercise.sets.push(set);
    }

    if (
      row.workout_set_achievement_id !== null &&
      row.achievement_type !== null &&
      row.previous_best !== null &&
      row.new_best_value !== null
    ) {
      set.achievements.push({
        type: row.achievement_type,
        previousBestValue: row.previous_best,
        newBestValue: row.new_best_value,
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

        const setResult = await db.runAsync(
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

        const workoutSetId = setResult.lastInsertRowId;

        for (const achievement of set.achievements) {
          await db.runAsync(
            `
              INSERT INTO workout_set_achievements (
                workout_set_id,
                achievement_type,
                previous_best,
                new_best_value,
                created_at
              )
              VALUES (?, ?, ?, ?, ?)
              `,
            [
              workoutSetId,
              achievement.type,
              achievement.previousBestValue,
              achievement.newBestValue,
              completedAt,
            ],
          );
        }
      }
    }
  });
}

export async function getLatestExercisePerformances(
  db: SQLiteDatabase,
  exerciseIds: string[],
): Promise<Partial<Record<string, LatestExercisePerformance>>> {
  const uniqueExerciseIds = [...new Set(exerciseIds)];

  if (uniqueExerciseIds.length === 0) return {};

  const placeholders = uniqueExerciseIds.map(() => "?").join(", ");

  const rows = await db.getAllAsync<LatestPerformanceRow>(
    `
    WITH ranked_exercises AS (
      SELECT
        we.id AS workout_exercise_id,
        we.exercise_id,
        we.rest_seconds,
        ROW_NUMBER() OVER (
          PARTITION BY we.exercise_id
          ORDER BY w.completed_at DESC, we.id DESC
        ) AS occurrence_rank
      FROM workout_exercises we
      JOIN workouts w
        ON w.id = we.workout_id
      WHERE we.exercise_id IN (${placeholders})
    )
    SELECT
      ranked.exercise_id,
      ranked.rest_seconds,
      ws.set_number,
      ws.weight_grams,
      ws.reps
    FROM ranked_exercises ranked
    JOIN workout_sets ws
      ON ws.workout_exercise_id = ranked.workout_exercise_id
    WHERE ranked.occurrence_rank = 1
    ORDER BY ranked.exercise_id, ws.set_number
    `,
    uniqueExerciseIds,
  );

  const result: Record<string, LatestExercisePerformance> = {};

  for (const row of rows) {
    if (!result[row.exercise_id]) {
      result[row.exercise_id] = {
        exerciseId: row.exercise_id,
        restTime: row.rest_seconds,
        sets: [],
      };
    }

    result[row.exercise_id].sets.push({
      id: row.set_number,
      complete: false,
      weight: String(row.weight_grams / 1000),
      reps: String(row.reps),
      achievements: [],
    });
  }

  return result;
}

export async function getBaselines(
  db: SQLiteDatabase,
  exerciseIds: string[],
): Promise<ExercisePrBaselines> {
  const uniqueIds = [...new Set(exerciseIds)];

  if (uniqueIds.length === 0) return {};

  const placeholders = uniqueIds.map(() => "?").join(", ");

  const rows = await db.getAllAsync<ExercisePrBaselineRow>(
    `
    SELECT
      we.exercise_id,
      ws.weight_grams,
      MAX(ws.reps) AS best_reps
    FROM workout_sets ws
    JOIN workout_exercises we
      ON we.id = ws.workout_exercise_id
    WHERE we.exercise_id IN (${placeholders})
    GROUP BY we.exercise_id, ws.weight_grams

    `,
    uniqueIds,
  );

  const result: ExercisePrBaselines = {};

  for (const exerciseId of uniqueIds) {
    result[exerciseId] = {
      bestWeightGrams: null,
      bestRepsByWeight: {},
    };
  }

  for (const row of rows) {
    const baseline = result[row.exercise_id];

    if (!baseline) continue;

    baseline.bestRepsByWeight[String(row.weight_grams)] = row.best_reps;

    if (
      baseline.bestWeightGrams === null ||
      row.weight_grams > baseline.bestWeightGrams
    ) {
      baseline.bestWeightGrams = row.weight_grams;
    }
  }

  return result;
}

export async function deleteWorkout(db: SQLiteDatabase, id: string) {
  return db.runAsync(`DELETE FROM workouts WHERE id = $value`, { $value: id });
}
