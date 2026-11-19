export const SET_TYPES = ["normal", "warmup", "dropset", "failure"] as const;

export type SetType = (typeof SET_TYPES)[number];

export type SetAchievement = {
  type: string;
  previousBestValue: number;
  newBestValue: number;
};

export type SetRow = {
  id: number;
  complete: boolean;
  weight: string;
  reps: string;
  type: SetType;
  achievements: SetAchievement[];
};

export type Exercise = {
  exerciseId: string;
  name: string;
  mechanic: string | null | undefined;
  restTime: number | null;
  sets: SetRow[];
};

export type Workout = {
  id: string;
  workoutName: string;
  date: string;
  exercises: Exercise[];
  workoutDuration: number;
};

export type ExercisePrBaseline = {
  bestWeightGrams: number | null;
  bestRepsByWeight: Record<string, number>;
  bestOneRepMax: number | null;
};
