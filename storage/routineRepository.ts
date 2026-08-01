import exerciseCatalog from "@/app/datasets/exercises.json";
import { Exercise } from "@/types/workout";
import type { SQLiteDatabase } from "expo-sqlite";

export type Routine = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  exercises: Exercise[];
};

export type RoutineUpdate = {
  id: string;
  name: string;
  updatedAt: number;
  exercises: Exercise[];
};

type RoutineRow = {
  routine_id: string;
  routine_name: string;
  created_at: number;
  updated_at: number;

  exercise_id: string | null;
  rest_seconds: number | null;
  set_count: number | null;
  position: number | null;
};

const exercisesById = new Map(
  exerciseCatalog.map((exercise) => [exercise.id, exercise]),
);

export async function getAllRoutines(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<RoutineRow>(`
      SELECT r.id as routine_id, r.name as routine_name, r.created_at, r.updated_at, re.exercise_id, re.rest_seconds, re.set_count, re.position FROM routines r LEFT JOIN routine_exercises re ON r.id = re.routine_id  ORDER BY r.created_at DESC, re.position ASC
    `);

  const routinesMap = new Map<string, Routine>();

  for (const row of rows) {
    let routine = routinesMap.get(row.routine_id);

    if (!routine) {
      routine = {
        id: row.routine_id,
        name: row.routine_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        exercises: [],
      };

      routinesMap.set(row.routine_id, routine);
    }

    if (row.exercise_id !== null) {
      const catalogueExericse = exercisesById.get(row.exercise_id);

      if (catalogueExericse) {
        const setCount = row.set_count ?? 1;

        routine.exercises.push({
          exerciseId: catalogueExericse.id,
          name: catalogueExericse.name,
          mechanic: catalogueExericse.mechanic,
          restTime: row.rest_seconds ?? 0,
          sets: Array.from({ length: setCount }, (_, index) => ({
            id: index + 1,
            complete: false,
            weight: "",
            reps: "",
          })),
        });
      }
    }
  }

  return Array.from(routinesMap.values());
}

export async function saveRoutine(db: SQLiteDatabase, routine: Routine) {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `
      INSERT INTO routines (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`,
      [routine.id, routine.name, routine.createdAt, routine.updatedAt],
    );

    for (const [index, exercise] of routine.exercises.entries()) {
      const exerciseRow = await db.runAsync(
        `
          INSERT INTO routine_exercises (routine_id, exercise_id, rest_seconds, set_count, position) VALUES (?, ?, ?, ?, ?)
          `,
        [
          routine.id,
          exercise.exerciseId,
          exercise.restTime,
          exercise.sets.length,
          index,
        ],
      );

      if (!exerciseRow) {
        console.warn("Failed to create exercise:", exercise);
      }
    }
  });

  return routine;
}

export async function updateRoutine(
  db: SQLiteDatabase,
  routine: RoutineUpdate,
) {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE routines SET name = ?, updated_at = ? WHERE id = ?`,
      [routine.name, routine.updatedAt, routine.id],
    );

    await db.runAsync(`DELETE FROM routine_exercises WHERE routine_id = ?`, [
      routine.id,
    ]);

    for (const [position, exercise] of routine.exercises.entries()) {
      await db.runAsync(
        `
        INSERT INTO routine_exercises (routine_id, exercise_id, rest_seconds, set_count, position) VALUES (?, ?, ?, ?, ?)
        `,
        [
          routine.id,
          exercise.exerciseId,
          exercise.restTime,
          exercise.sets.length,
          position,
        ],
      );
    }
  });
}

export async function deleteRoutine(db: SQLiteDatabase, routineId: string) {
  return await db.runAsync(
    `
    DELETE FROM routines WHERE id = ?`,
    [routineId],
  );
}

export async function getRoutine(db: SQLiteDatabase, routineId: string) {
  const rows = await db.getAllAsync<RoutineRow>(
    `
        SELECT
          r.id AS routine_id,
          r.name AS routine_name,
          r.created_at,
          r.updated_at,

          re.exercise_id,
          re.rest_seconds,
          re.set_count,
          re.position

          FROM routines r

          LEFT JOIN routine_exercises re
            ON re.routine_id = r.id

          WHERE r.id = ?

          ORDER BY re.position ASC
        `,
    [routineId],
  );

  if (rows.length === 0) return null;

  const exercises: Exercise[] = [];

  for (const row of rows) {
    if (row.exercise_id === null) continue;

    const catalogueExercise = exercisesById.get(row.exercise_id);

    if (!catalogueExercise) {
      console.warn(`Unknown exercise ID: ${row.exercise_id}`);
      continue;
    }

    const setCount = row.set_count ?? 1;

    exercises.push({
      exerciseId: catalogueExercise.id,
      name: catalogueExercise.name,
      mechanic: catalogueExercise.mechanic,
      restTime: row.rest_seconds ?? 0,
      sets: Array.from({ length: setCount }, (_, index) => ({
        id: index + 1,
        complete: false,
        weight: "",
        reps: "",
      })),
    });
  }

  return {
    id: rows[0].routine_id,
    name: rows[0].routine_name,
    createdAt: rows[0].created_at,
    updatedAt: rows[0].updated_at,
    exercises,
  };
}
