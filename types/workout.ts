export type SetRow = {
  id: number;
  complete: boolean;
  weight: string;
  reps: string;
};

export type Exercise = {
  exerciseId: string;
  name: string;
  mechanic: string | null | undefined;
  restTime: number;
  sets: SetRow[];
};

export type Workout = {
  id: string;
  workoutName: string;
  date: string;
  exercises: Exercise[];
  workoutDuration: number;
};
