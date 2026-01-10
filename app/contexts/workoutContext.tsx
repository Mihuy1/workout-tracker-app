import { createContext, useContext, useState } from "react";
import { Exercise, SetRow } from "../types/workout";

type workoutContextType = {
  exercises: Exercise[];
  addExercise: (exercise: Exercise) => void;
  addExercises: (exercises: Exercise[]) => void;
  removeExercise: (exerciseName: string) => void;
  checkIfExerciseAlreadyAdded: (exerciseName: string) => boolean;
  addSet: (exerciseName: string) => void;
  removeSet: (exerciseName: string, setId: number) => void;
  updateSet: (
    exerciseName: string,
    setId: number,
    patch: Partial<Pick<SetRow, "weight" | "reps" | "complete">>
  ) => void;
  clearWorkout: () => void;
};

const workoutContext = createContext<workoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const addExercise = (exercise: Exercise) => {
    const exerciseWithSets = {
      ...exercise,
      sets: exercise.sets ?? [{ id: 1, complete: false, weight: "", reps: "" }],
    };
    setExercises((prevExercises) => [...prevExercises, exerciseWithSets]);
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

  const addSet = (exerciseName: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.name !== exerciseName) return ex;
        const nextId = ex.sets.length
          ? Math.max(...ex.sets.map((s) => s.id)) + 1
          : 1;
        return {
          ...ex,
          sets: [
            ...ex.sets,
            { id: nextId, complete: false, weight: "", reps: "" },
          ],
        };
      })
    );
  };

  const removeSet = (exerciseName: string, setId: number) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.name !== exerciseName) return ex;
        return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
      })
    );
  };

  const updateSet = (
    exerciseName: string,
    setId: number,
    patch: Partial<Pick<SetRow, "weight" | "reps" | "complete">>
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.name !== exerciseName) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
        };
      })
    );
  };

  const clearWorkout = () => {
    setExercises([]);
  };

  return (
    <workoutContext.Provider
      value={{
        exercises,
        addExercise,
        addExercises,
        removeExercise,
        checkIfExerciseAlreadyAdded,
        addSet,
        removeSet,
        updateSet,
        clearWorkout,
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
