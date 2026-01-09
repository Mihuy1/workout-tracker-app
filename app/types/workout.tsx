export type Exercise = {
  name: string;
  mechanic: string | null;
};

export type Workout = {
  id: string;
  workoutName: string;
  exercises: Exercise[];
};
