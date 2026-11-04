import exerciseCatalog from "@/data/exercises.json";
import { estimateOneRepMax } from "@/utils/oneRepMax";
import { weightToGrams, type WeightUnit } from "@/utils/weightUnits";
import type { SQLiteDatabase } from "expo-sqlite";
import {
  getWorkoutHistory,
  getWorkoutStats,
  type WorkoutStats,
} from "./workoutRepository";

// Dev-only test data generator. Never shipped: every function throws outside
// __DEV__ and the Settings UI that calls it is also dev-gated.
//
// Data is deterministic (fixed PRNG seed, fixed patterns) so the Statistics
// page can be verified against numbers computed independently from the
// generated objects. Seeded workouts use ids prefixed with DEV_SEED_ID_PREFIX
// so they can be removed without touching real workouts.

export const DEV_SEED_ID_PREFIX = "dev-seed-";

const DAY_MS = 86_400_000;

type CatalogExercise = {
  id: string;
  name: string;
  mechanic: string | null;
  equipment: string | null;
};

type SeededAchievement = {
  type: string;
  previousBestValue: number;
  newBestValue: number;
};

type SeededSet = {
  weightGrams: number;
  reps: number;
  achievements: SeededAchievement[];
};

type SeededExercise = {
  exerciseId: string;
  name: string;
  mechanic: string | null;
  restSeconds: number;
  sets: SeededSet[];
};

type SeededWorkout = {
  id: string;
  name: string;
  completedAt: number;
  durationMs: number;
  exercises: SeededExercise[];
};

type SeedRowCounts = {
  workouts: number;
  exercises: number;
  sets: number;
  achievements: number;
};

const WORKOUT_NAMES = [
  "Push Day",
  "Pull Day",
  "Leg Day",
  "Upper Body",
  "Full Body",
];

const EXERCISE_POOL_SIZE = 12;
const SEED_INTERVAL_DAYS = 2;
const WORKOUT_DURATION_MS = 60 * 60 * 1000; // Fixed 60 minutes for easy checks.

// A fixed pool so each exercise gets many occurrences across the seeded
// workouts, which makes the exercise-progress charts meaningful.
function selectExercisePool(): CatalogExercise[] {
  const catalog = exerciseCatalog as CatalogExercise[];

  const weightedCompound = catalog.filter(
    (exercise) =>
      exercise.mechanic === "compound" &&
      /barbell|dumbbell|machine|cable/i.test(exercise.equipment ?? ""),
  );

  const source =
    weightedCompound.length >= EXERCISE_POOL_SIZE
      ? weightedCompound
      : catalog.filter((exercise) => exercise.mechanic === "compound");

  const pool: CatalogExercise[] = [];

  for (let index = 0; index < EXERCISE_POOL_SIZE; index++) {
    pool.push(source[Math.floor((index * source.length) / EXERCISE_POOL_SIZE)]);
  }

  return pool;
}

type ExerciseBaseline = {
  bestWeightGrams: number | null;
  bestRepsByWeight: Map<string, number>;
  bestOneRepMax: number | null;
};

// Mirrors the app's achievement rules from calculateSetAchievements in
// WorkoutExerciseCard: baselines fold in every completed set as we go, and
// achievements are strictly-greater comparisons against those baselines.
function buildSet(
  baseline: ExerciseBaseline,
  weightGrams: number,
  reps: number,
): SeededSet {
  const achievements: SeededAchievement[] = [];
  const candidateOneRm = Math.round(estimateOneRepMax(weightGrams, reps));

  if (baseline.bestWeightGrams !== null) {
    if (weightGrams > baseline.bestWeightGrams) {
      achievements.push({
        type: "new_weight_pr",
        previousBestValue: baseline.bestWeightGrams,
        newBestValue: weightGrams,
      });
    }

    const bestRepsAtWeight = baseline.bestRepsByWeight.get(String(weightGrams));

    if (bestRepsAtWeight !== undefined && reps > bestRepsAtWeight) {
      achievements.push({
        type: "new_reps_pr",
        previousBestValue: bestRepsAtWeight,
        newBestValue: reps,
      });
    }

    if (
      baseline.bestOneRepMax !== null &&
      candidateOneRm > baseline.bestOneRepMax
    ) {
      achievements.push({
        type: "new_one_rep_max",
        previousBestValue: baseline.bestOneRepMax,
        newBestValue: candidateOneRm,
      });
    }
  }

  baseline.bestWeightGrams = Math.max(
    baseline.bestWeightGrams ?? 0,
    weightGrams,
  );
  baseline.bestRepsByWeight.set(
    String(weightGrams),
    Math.max(baseline.bestRepsByWeight.get(String(weightGrams)) ?? 0, reps),
  );
  baseline.bestOneRepMax = Math.max(
    baseline.bestOneRepMax ?? 0,
    candidateOneRm,
  );

  return { weightGrams, reps, achievements };
}

function generateDevWorkouts(count: number): SeededWorkout[] {
  const pool = selectExercisePool();
  const now = Date.now();
  const workouts: SeededWorkout[] = [];
  const baselines = new Map<number, ExerciseBaseline>();

  for (let workoutIndex = 0; workoutIndex < count; workoutIndex++) {
    // Oldest first. The newest workout sits ~1 minute in the past so it is
    // always inside the statistics "current" window when checked right after
    // seeding.
    const completedAt =
      now -
      (count - 1 - workoutIndex) * SEED_INTERVAL_DAYS * DAY_MS -
      60_000;

    const exerciseCount = 4 + (workoutIndex % 3);
    const exercises: SeededExercise[] = [];

    for (let exerciseIndex = 0; exerciseIndex < exerciseCount; exerciseIndex++) {
      const poolIndex = (workoutIndex + exerciseIndex) % pool.length;
      const catalogExercise = pool[poolIndex];
      const setCount = 3 + ((workoutIndex + exerciseIndex) % 2);
      const sets: SeededSet[] = [];

      const baseline = baselines.get(poolIndex) ?? {
        bestWeightGrams: null,
        bestRepsByWeight: new Map<string, number>(),
        bestOneRepMax: null,
      };
      baselines.set(poolIndex, baseline);

      for (let setIndex = 0; setIndex < setCount; setIndex++) {
        // Base weight is stable per exercise, +2.5 kg every 4th workout
        // (progressive overload), with an occasional deload week to create
        // same-weight repeats that produce reps PRs.
        const baseKg = 20 + poolIndex * 7.5;
        const bumpKg = Math.floor(workoutIndex / 4) * 2.5;
        const deloadKg = workoutIndex % 8 === 3 ? -2.5 : 0;
        const weightGrams = weightToGrams(baseKg + bumpKg + deloadKg, "kg");
        const reps = 5 + ((workoutIndex * 3 + poolIndex * 7 + setIndex * 5) % 8);

        sets.push(buildSet(baseline, weightGrams, reps));
      }

      exercises.push({
        exerciseId: catalogExercise.id,
        name: catalogExercise.name,
        mechanic: catalogExercise.mechanic,
        restSeconds: 90,
        sets,
      });
    }

    workouts.push({
      id: `${DEV_SEED_ID_PREFIX}${String(workoutIndex).padStart(3, "0")}`,
      name: WORKOUT_NAMES[workoutIndex % WORKOUT_NAMES.length],
      completedAt,
      durationMs: WORKOUT_DURATION_MS,
      exercises,
    });
  }

  return workouts;
}

function summariseWorkouts(workouts: SeededWorkout[]): {
  workoutCount: number;
  totalSets: number;
  totalDuration: number;
  totalVolume: number;
} {
  return {
    workoutCount: workouts.length,
    totalSets: workouts.reduce(
      (sum, workout) =>
        sum +
        workout.exercises.reduce(
          (exerciseSum, exercise) => exerciseSum + exercise.sets.length,
          0,
        ),
      0,
    ),
    totalDuration: workouts.reduce(
      (sum, workout) => sum + workout.durationMs,
      0,
    ),
    totalVolume: workouts.reduce(
      (sum, workout) =>
        sum +
        workout.exercises.reduce(
          (exerciseSum, exercise) =>
            exerciseSum +
            exercise.sets.reduce(
              (setSum, set) => setSum + set.weightGrams * set.reps,
              0,
            ),
          0,
        ),
      0,
    ),
  };
}

function expectedStats(
  workouts: SeededWorkout[],
  now: number,
  days: number,
): { current: WorkoutStats; previous: WorkoutStats } {
  const windowMs = days * DAY_MS;

  const inWindow = (from: number, to: number) =>
    summariseWorkouts(
      workouts.filter(
        (workout) => workout.completedAt >= from && workout.completedAt < to,
      ),
    );

  return {
    current: inWindow(now - windowMs, now),
    previous: inWindow(now - 2 * windowMs, now - windowMs),
  };
}

function formatDuration(ms: number) {
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  return hours > 0 ? `${hours}h ${totalMinutes % 60}m` : `${totalMinutes}m`;
}

async function logStatisticsCrossCheck(
  db: SQLiteDatabase,
  workouts: SeededWorkout[],
) {
  const now = Date.now();

  for (const days of [30, 90, 365]) {
    const expected = expectedStats(workouts, now, days);
    const actualCurrent = await getWorkoutStats(db, now - days * DAY_MS, now);
    const actualPrevious = await getWorkoutStats(
      db,
      now - 2 * days * DAY_MS,
      now - days * DAY_MS,
    );

    for (const [label, expectedStats, actual] of [
      ["current", expected.current, actualCurrent],
      ["previous", expected.previous, actualPrevious],
    ] as const) {
      const mismatch =
        expectedStats.workoutCount !== actual.workoutCount ||
        expectedStats.totalSets !== actual.totalSets ||
        expectedStats.totalDuration !== actual.totalDuration ||
        expectedStats.totalVolume !== actual.totalVolume;

      console.log(
        `[dev-seed] ${days}d ${label}: count ${expectedStats.workoutCount}/${actual.workoutCount}, ` +
          `sets ${expectedStats.totalSets}/${actual.totalSets}, ` +
          `duration ${formatDuration(expectedStats.totalDuration)}/${formatDuration(actual.totalDuration)}, ` +
          `volume ${(expectedStats.totalVolume / 1000).toFixed(1)}kg/${(actual.totalVolume / 1000).toFixed(1)}kg` +
          (mismatch ? "  ⚠️ MISMATCH" : "  ✓"),
      );
    }
  }
}

export async function seedDevWorkouts(
  db: SQLiteDatabase,
  count = 100,
): Promise<SeedRowCounts> {
  if (!__DEV__) throw new Error("seedDevWorkouts is only available in dev");

  const startedAt = Date.now();
  const workouts = generateDevWorkouts(count);
  const rowCounts: SeedRowCounts = {
    workouts: 0,
    exercises: 0,
    sets: 0,
    achievements: 0,
  };

  await db.withTransactionAsync(async () => {
    // Reseeding replaces previous dev data only; real workouts are untouched.
    await db.runAsync(`DELETE FROM workouts WHERE id LIKE ?`, [
      `${DEV_SEED_ID_PREFIX}%`,
    ]);

    for (const workout of workouts) {
      await db.runAsync(
        `
        INSERT INTO workouts (id, name, completed_at, duration_ms)
        VALUES (?, ?, ?, ?)
        `,
        [workout.id, workout.name, workout.completedAt, workout.durationMs],
      );

      for (const [position, exercise] of workout.exercises.entries()) {
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
            workout.id,
            exercise.exerciseId,
            exercise.name,
            exercise.mechanic,
            exercise.restSeconds,
            position,
          ],
        );
        rowCounts.exercises += 1;

        for (const [setNumber, set] of exercise.sets.entries()) {
          const setResult = await db.runAsync(
            `
            INSERT INTO workout_sets (workout_exercise_id, set_number, weight_grams, reps)
            VALUES (?, ?, ?, ?)
            `,
            [
              exerciseResult.lastInsertRowId,
              setNumber + 1,
              set.weightGrams,
              set.reps,
            ],
          );
          rowCounts.sets += 1;

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
                setResult.lastInsertRowId,
                achievement.type,
                achievement.previousBestValue,
                achievement.newBestValue,
                workout.completedAt,
              ],
            );
            rowCounts.achievements += 1;
          }
        }
      }
    }

    rowCounts.workouts = workouts.length;
  });

  const elapsedMs = Date.now() - startedAt;
  console.log(
    `[dev-seed] ${rowCounts.workouts} workouts inserted in ${elapsedMs}ms ` +
      `(exercises=${rowCounts.exercises}, sets=${rowCounts.sets}, ` +
      `achievements=${rowCounts.achievements})`,
  );

  await logStatisticsCrossCheck(db, workouts);

  return rowCounts;
}

export async function removeDevWorkouts(db: SQLiteDatabase): Promise<number> {
  if (!__DEV__) throw new Error("removeDevWorkouts is only available in dev");

  const result = await db.runAsync(`DELETE FROM workouts WHERE id LIKE ?`, [
    `${DEV_SEED_ID_PREFIX}%`,
  ]);

  console.log(`[dev-seed] removed ${result.changes} workouts`);

  return result.changes;
}

export async function countDevWorkouts(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM workouts WHERE id LIKE ?`,
    [`${DEV_SEED_ID_PREFIX}%`],
  );

  return row?.count ?? 0;
}

// Times a full history fetch the same way the History tab runs it, so the
// query cost with the seeded volume is visible in the console.
export async function benchmarkHistoryFetch(
  db: SQLiteDatabase,
  weightUnit: WeightUnit,
): Promise<{ workoutCount: number; elapsedMs: number }> {
  const startedAt = Date.now();
  const history = await getWorkoutHistory(db, weightUnit);
  const elapsedMs = Date.now() - startedAt;

  console.log(
    `[dev-seed] getWorkoutHistory returned ${history.length} workouts in ${elapsedMs}ms`,
  );

  return { workoutCount: history.length, elapsedMs };
}
