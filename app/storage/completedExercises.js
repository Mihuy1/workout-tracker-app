import { MMKV } from "react-native-mmkv";

const storage = new MMKV();
const COMPLETED_EXERCISES_KEY = "completedExercises";

export const getCompletedExercises = async () => {
  try {
    const value = storage.getString(COMPLETED_EXERCISES_KEY);
    return value != null ? JSON.parse(value) : [];
  } catch (error) {
    console.error("Error getting completed exercises:", error);
    return [];
  }
};

export const getSavedPresets = async () => {
  try {
    const keys = storage.getAllKeys();
    const presetKeys = keys.filter((key) => key.startsWith("preset_"));
    const presets = {};
    for (const key of presetKeys) {
      const value = storage.getString(key);
      presets[key.replace("preset_", "")] = value ? JSON.parse(value) : [];
    }
    return presets;
  } catch (error) {
    console.error("Error getting saved presets:", error);
    return {};
  }
};

export const saveCompletedExercises = async (exercises) => {
  try {
    storage.set(COMPLETED_EXERCISES_KEY, JSON.stringify(exercises));
  } catch (error) {
    console.error("Error saving completed exercises:", error);
  }
};

export const saveCompletedExerciseAsPreset = async (exercises, presetName) => {
  try {
    const presetKey = `preset_${presetName}`;
    storage.set(presetKey, JSON.stringify(exercises));
  } catch (error) {
    console.error("Error saving preset:", error);
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
  const raw = storage.getString(COMPLETED_EXERCISES_KEY);
  console.log("Raw completed exercises data:", raw);
  const parsed = raw ? JSON.parse(raw) : [];
  console.log("Parsed completed exercises data:", parsed);
};
