import { Exercise, SetRow } from "@/types/workout";
import { createContext, useContext, useState } from "react";

type workoutContextType = {
  exercises: Exercise[];
  getExercises: () => Exercise[];
  addExercise: (exercise: Exercise) => void;
  addExercises: (exercises: Exercise[]) => void;
  removeExercise: (exerciseName: string) => void;
  checkIfExerciseAlreadyAdded: (exerciseName: string) => boolean;
  addSet: (exerciseName: string) => void;
  removeSet: (exerciseName: string, setId: number) => void;
  updateSet: (
    exerciseName: string,
    setId: number,
    patch: Partial<Pick<SetRow, "weight" | "reps" | "complete">>,
  ) => void;
  handleCompleteSet: (
    exerciseName: string,
    setId: number,
    complete: boolean,
    weight: string,
    reps: string,
  ) => void;
  clearWorkout: () => void;
};

const workoutContext = createContext<workoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const getExercises = () => {
    return exercises;
  };

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
      prevExercises.filter((ex) => ex.name !== exerciseName),
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
      }),
    );
  };

  const removeSet = (exerciseName: string, setId: number) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.name !== exerciseName) return ex;
        return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
      }),
    );
  };

  const updateSet = (
    exerciseName: string,
    setId: number,
    patch: Partial<Pick<SetRow, "weight" | "reps" | "complete">>,
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.name !== exerciseName) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
        };
      }),
    );
  };

  const handleCompleteSet = (
    exerciseName: string,
    setId: number,
    complete: boolean,
    weight: string,
    reps: string,
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.name !== exerciseName) return ex;

        return {
          ...ex,
          sets: ex.sets.map((set) =>
            set.id === setId ? { ...set, complete, weight, reps } : set,
          ),
        };
      }),
    );
  };

  const clearWorkout = () => {
    setExercises([]);
  };

  return (
    <workoutContext.Provider
      value={{
        exercises,
        getExercises,
        addExercise,
        addExercises,
        removeExercise,
        checkIfExerciseAlreadyAdded,
        addSet,
        removeSet,
        updateSet,
        handleCompleteSet,
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
