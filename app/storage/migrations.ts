import type { SQLiteDatabase } from "expo-sqlite";

const DATABASE_VERSION = 1;

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

  if (currentVersion === 0) {
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

      await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    });
  }
}
