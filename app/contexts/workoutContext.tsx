import { createContext, useContext, useState } from "react";
import { Exercise } from "../types/workout";

type workoutContextType = {
  exercises: Exercise[];
  addExercise: (exercise: Exercise) => void;
  addExercises: (exercises: Exercise[]) => void;
  removeExercise: (exerciseName: string) => void;
  checkIfExerciseAlreadyAdded: (exerciseName: string) => boolean;
};

const workoutContext = createContext<workoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const addExercise = (exercise: Exercise) => {
    setExercises((prevExercises) => [...prevExercises, exercise]);
  };

  const addExercises = (newExercises: Exercise[]) => {
    setExercises((prevExercises) => [...prevExercises, ...newExercises]);
  };

  const removeExercise = (exerciseName: string) => {
    setExercises((prevExercises) =>
      prevExercises.filter((ex) => ex.name !== exerciseName)
    );
  };

  const checkIfExerciseAlreadyAdded = (exerciseName: string) => {
    return exercises.some((ex) => ex.name === exerciseName);
  };

  return (
    <workoutContext.Provider
      value={{
        exercises,
        addExercise,
        addExercises,
        removeExercise,
        checkIfExerciseAlreadyAdded,
      }}
    >
      {children}
    </workoutContext.Provider>
  );
};

export const useWorkout = () => {
  const ctx = useContext(workoutContext);
  if (!ctx) throw new Error("useWorkout must be used within a WorkoutProvider");
  return ctx;
};
