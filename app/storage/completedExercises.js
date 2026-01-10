import AsyncStorage from "@react-native-async-storage/async-storage";

const COMPLETED_EXERCISES_KEY = "completedExercises";

export const getCompletedExercises = async () => {
  try {
    const value = await AsyncStorage.getItem(COMPLETED_EXERCISES_KEY);
    return value != null ? JSON.parse(value) : [];
  } catch (error) {
    console.error("Error getting completed exercises:", error);
    return [];
  }
};

export const saveCompletedExercises = async (exercises) => {
  try {
    await AsyncStorage.setItem(
      COMPLETED_EXERCISES_KEY,
      JSON.stringify(exercises)
    );
  } catch (error) {
    console.error("Error saving completed exercises:", error);
  }
};

export const addCompletedExercise = async (exercise) => {
  try {
    const existing = await getCompletedExercises();
    const updated = [...existing, exercise];
    await saveCompletedExercises(updated);
  } catch (error) {
    console.error("Failed to add exercise", error);
  }
};

export const debugPrintCompletedExercises = async () => {
  const raw = await AsyncStorage.getItem(COMPLETED_EXERCISES_KEY);
  console.log("Raw completed exercises data:", raw);
  const parsed = raw ? JSON.parse(raw) : [];
  console.log("Parsed completed exercises data:", parsed);
};
