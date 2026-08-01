import type { SQLiteDatabase } from "expo-sqlite";

const DATABASE_VERSION = 2;

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
      -- workouts
      -- workout_exercises
      -- workout_sets
      -- workout indexes
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
}
