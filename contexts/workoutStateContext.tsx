import { ExercisePrBaselines } from "@/storage/workoutRepository";
import { Exercise } from "@/types/workout";
import { createContext, useContext } from "react";

type WorkoutStateContextType = {
  exercises: Exercise[];
  prBaselines: ExercisePrBaselines;
};

export const WorkoutStateContext = createContext<
  WorkoutStateContextType | undefined
>(undefined);

export function useWorkoutState() {
  const context = useContext(WorkoutStateContext);

  if (!context) {
    throw Error("useWorkoutState must be used within WorkoutProvider");
  }

  return context;
}
