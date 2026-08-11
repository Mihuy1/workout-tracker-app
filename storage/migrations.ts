import type { SQLiteDatabase } from "expo-sqlite";

const DATABASE_VERSION = 3;

export async function migrateDatabase(db: SQLiteDatabase) {
  // These settings are applied whenever the database is opened.
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );

  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion < 1) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE workouts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          completed_at INTEGER NOT NULL,
          duration_ms INTEGER NOT NULL
        );

        CREATE TABLE workout_exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workout_id TEXT NOT NULL,
          exercise_id TEXT NOT NULL,
          exercise_name TEXT NOT NULL,
          mechanic TEXT,
          rest_seconds INTEGER NOT NULL DEFAULT 0,
          position INTEGER NOT NULL,

          FOREIGN KEY (workout_id)
            REFERENCES workouts(id)
            ON DELETE CASCADE
        );

        CREATE TABLE workout_sets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workout_exercise_id INTEGER NOT NULL,
          set_number INTEGER NOT NULL,
          weight_grams INTEGER NOT NULL,
          reps INTEGER NOT NULL,

          FOREIGN KEY (workout_exercise_id)
            REFERENCES workout_exercises(id)
            ON DELETE CASCADE
        );

        CREATE INDEX idx_workouts_completed_at
          ON workouts(completed_at DESC);

        CREATE INDEX idx_workout_exercises_exercise
          ON workout_exercises(exercise_id);

        CREATE INDEX idx_workout_exercises_workout
          ON workout_exercises(workout_id);

        CREATE INDEX idx_workout_sets_exercise
          ON workout_sets(workout_exercise_id);
      `);

      await db.execAsync("PRAGMA user_version = 1");
    });
  }

  if (currentVersion < 2) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
      CREATE TABLE routines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE routine_exercises (
        routine_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        rest_seconds INTEGER NOT NULL DEFAULT 0,
        set_count INTEGER NOT NULL DEFAULT 1,
        position INTEGER NOT NULL,

        PRIMARY KEY (routine_id, exercise_id),

        FOREIGN KEY (routine_id)
          REFERENCES routines(id)
          ON DELETE CASCADE
      );

      CREATE INDEX idx_routine_exercises_position
        ON routine_exercises(routine_id, position);
    `);

      await db.execAsync("PRAGMA user_version = 2");
    });
  }

  if (currentVersion < 3) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
      CREATE TABLE workout_set_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_set_id INTEGER NOT NULL,
        achievement_type TEXT NOT NULL,
        previous_best INTEGER,
        new_best_value INTEGER NOT NULL,
        created_at INTEGER NOT NULL,

        UNIQUE (workout_set_id, achievement_type),

        FOREIGN KEY (workout_set_id)
          REFERENCES workout_sets(id)
          ON DELETE CASCADE
      );

      CREATE INDEX idx_workout_set_achievements_set
        ON workout_set_achievements(workout_set_id);
    `);

      await db.execAsync("PRAGMA user_version = 3");
    });
  }
}
