import { Exercise, SetRow } from "@/types/workout";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { WorkoutStateContext } from "./workoutStateContext";

type WorkoutActionsContextType = {
  setRestTime: (exerciseName: string, time: number) => void;
  addExercise: (exercise: Exercise) => void;
  addExercises: (exercises: Exercise[]) => void;
  removeExercise: (exerciseName: string) => void;
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

const workoutActionsContext = createContext<
  WorkoutActionsContextType | undefined
>(undefined);

export const WorkoutProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const setRestTime = useCallback((exerciseName: string, time: number) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.name !== exerciseName) return ex;

        return {
          ...ex,
          restTime: time,
        };
      }),
    );
  }, []);

  const addExercise = useCallback((exercise: Exercise) => {
    const exerciseWithSets = {
      ...exercise,
      sets: exercise.sets,
      restTime: exercise.restTime ?? 0,
    };

    setExercises((prevExercises) => [...prevExercises, exerciseWithSets]);
  }, []);

  const addExercises = useCallback((newExercises: Exercise[]) => {
    setExercises((prevExercises) => [...prevExercises, ...newExercises]);
  }, []);

  const removeExercise = useCallback((exerciseName: string) => {
    setExercises((prevExercises) =>
      prevExercises.filter((ex) => ex.name !== exerciseName),
    );
  }, []);

  const addSet = useCallback((exerciseName: string) => {
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
  }, []);

  const removeSet = useCallback((exerciseName: string, setId: number) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.name !== exerciseName) return ex;
        return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
      }),
    );
  }, []);

  const updateSet = useCallback(
    (
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
    },
    [],
  );

  const handleCompleteSet = useCallback(
    (
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
    },
    [],
  );

  const clearWorkout = useCallback(() => {
    setExercises([]);
  }, []);

  const workoutActions = useMemo(
    () => ({
      setRestTime,
      addExercise,
      addExercises,
      removeExercise,
      addSet,
      removeSet,
      updateSet,
      handleCompleteSet,
      clearWorkout,
    }),
    [
      setRestTime,
      addExercise,
      addExercises,
      removeExercise,
      addSet,
      removeSet,
      updateSet,
      handleCompleteSet,
      clearWorkout,
    ],
  );

  return (
    <WorkoutStateContext.Provider value={{ exercises }}>
      <workoutActionsContext.Provider value={workoutActions}>
        {children}
      </workoutActionsContext.Provider>
    </WorkoutStateContext.Provider>
  );
};

export const useWorkoutActions = () => {
  const context = useContext(workoutActionsContext);
  if (!context)
    throw new Error("useWorkoutActions must be used within a WorkoutProvider");
  return context;
};
