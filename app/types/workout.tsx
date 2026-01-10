export type SetRow = {
  id: number;
  complete: boolean;
  weight: string;
  reps: string;
};

export type Exercise = {
  name: string;
  mechanic: string | null;
  sets: SetRow[];
};

export type Workout = {
  id: string;
  workoutName: string;
  date: string;
  exercises: Exercise[];
};
