export type SetAchievement = {
  type: string;
  previousBestValue: number;
  newBestValue: number;
};

export type SetType = "normal" | "warmup" | "dropset" | "failure";

export type SetRow = {
  id: number;
  type: SetType;
  complete: boolean;
  weight: string;
  reps: string;
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
