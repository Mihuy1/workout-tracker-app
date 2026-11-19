import exerciseCatalog from "@/data/exercises.json";
import { Exercise, SetType } from "@/types/workout";
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
  set_type: SetType | null;
  set_number: number | null;

  exercise_id: string | null;
  rest_seconds: number | null;
  set_count: number | null;
  position: number | null;
};

type RoutineExerciseRow = {
  routine_id: string;
  exercise_id: string;
  rest_seconds: number | null;
  set_count: number;
  position: number;
};

const exercisesById = new Map(
  exerciseCatalog.map((exercise) => [exercise.id, exercise]),
);

export async function getAllRoutines(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<RoutineRow>(`
      SELECT r.id as routine_id, r.name as routine_name, r.created_at, r.updated_at, re.exercise_id, re.rest_seconds, re.set_count, re.position, rs.set_type, rs.set_number FROM routines r LEFT JOIN routine_exercises re ON r.id = re.routine_id LEFT JOIN routine_sets rs ON re.routine_id = rs.routine_id AND re.exercise_id = rs.exercise_id ORDER BY r.created_at DESC, re.position ASC, rs.set_number ASC
    `);

  const routinesMap = new Map<string, Routine>();
  const exercisesMap = new Map<string, Exercise>();

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
      const exerciseKey = JSON.stringify([row.exercise_id, row.routine_id]);
      const exerciseInfo = exercisesById.get(row.exercise_id);
      let exercise = exercisesMap.get(exerciseKey);

      if (!exercise && exerciseInfo) {
        exercise = {
          exerciseId: row.exercise_id,
          name: exerciseInfo.name,
          restTime: row.rest_seconds ?? null,
          mechanic: exerciseInfo.mechanic,
          sets: [],
        };

        exercisesMap.set(exerciseKey, exercise);
        routine.exercises.push(exercise);
      }

      if (exercise && row.set_number !== null && row.set_type !== null) {
        exercise.sets.push({
          id: row.set_number,
          type: row.set_type,
          complete: false,
          weight: "",
          reps: "",
          achievements: [],
        });
      }
    }
  }
  return Array.from(routinesMap.values());
}

export async function insertRoutine(db: SQLiteDatabase, routine: Routine) {
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

    for (const [setIndex, set] of exercise.sets.entries()) {
      await db.runAsync(
        `
          INSERT INTO routine_sets (routine_id, exercise_id, set_number, set_type) VALUES (?, ?, ?, ?)
          `,
        [routine.id, exercise.exerciseId, setIndex + 1, set.type],
      );
    }

    if (!exerciseRow) {
      console.warn("Failed to create exercise:", exercise);
    }
  }

  return routine;
}

export async function replaceRoutine(
  db: SQLiteDatabase,
  routine: RoutineUpdate,
) {
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

    for (const [setIndex, set] of exercise.sets.entries()) {
      await db.runAsync(
        `
          INSERT INTO routine_sets (routine_id, exercise_id, set_number, set_type) VALUES (?, ?, ?, ?)
          `,
        [routine.id, exercise.exerciseId, setIndex + 1, set.type],
      );
    }
  }
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
          re.position,

          rs.set_type,
          rs.set_number

          FROM routines r

          LEFT JOIN routine_exercises re
            ON re.routine_id = r.id

          LEFT JOIN routine_sets rs
            ON rs.routine_id = r.id
            AND rs.exercise_id = re.exercise_id

          WHERE r.id = ?

          ORDER BY re.position ASC, rs.set_number ASC
        `,
    [routineId],
  );

  if (rows.length === 0) return null;

  const exerciseMap = new Map<string, Exercise>();

  for (const row of rows) {
    if (row.exercise_id === null) continue;

    const catalogueExercise = exercisesById.get(row.exercise_id);

    if (!catalogueExercise) {
      console.warn(`Unknown exercise ID: ${row.exercise_id}`);
      continue;
    }

    let exercise = exerciseMap.get(row.exercise_id);

    if (!exercise) {
      exercise = {
        exerciseId: catalogueExercise.id,
        name: catalogueExercise.name,
        mechanic: catalogueExercise.mechanic,
        restTime: row.rest_seconds ?? null,
        sets: [],
      };
      exerciseMap.set(row.exercise_id, exercise);
    }

    if (exercise) {
      if (row.set_number !== null && row.set_type !== null) {
        exercise.sets.push({
          id: row.set_number,
          complete: false,
          weight: "",
          reps: "",
          type: row.set_type,
          achievements: [],
        });
      }
    }
  }

  return {
    id: rows[0].routine_id,
    name: rows[0].routine_name,
    createdAt: rows[0].created_at,
    updatedAt: rows[0].updated_at,
    exercises: Array.from(exerciseMap.values()),
  };
}

export async function getRoutineExercises(
  db: SQLiteDatabase,
  routienId: string,
) {
  const rows = await db.getAllAsync<RoutineExerciseRow>(
    `SELECT routine_id, exercise_id, rest_seconds, set_count, position FROM routine_exercises WHERE routine_id = ?`,
    [routienId],
  );

  return rows;
}
