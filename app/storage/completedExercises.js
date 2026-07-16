import AsyncStorage from "@react-native-async-storage/async-storage";

const COMPLETED_EXERCISES_KEY = "completedExercises";

export const getCompletedExercises = async () => {
  try {
    const value = await AsyncStorage.getItem(COMPLETED_EXERCISES_KEY);

    return value != null ? JSON.parse(value) : [];
  } catch (error) {
    console.error("Error getting completed exercises:", error);
    throw error;
  }
};

export const getAllLatestExercisesMap = async (name) => {
  try {
    const allWorkouts = await getCompletedExercises();

    const sortedWorkouts = allWorkouts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const historyMap = {};

    for (const workout of sortedWorkouts) {
      for (const exercise of workout.exercises) {
        if (!historyMap[exercise.name]) historyMap[exercise.name] = exercise;
      }
    }

    return historyMap;
  } catch (error) {
    console.error("Error finding latest exercise:", error);
    return {};
  }
};

export const getSavedPresets = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const presetKeys = keys.filter((key) => key.startsWith("preset_"));
    const presets = {};
    for (const key of presetKeys) {
      const value = await AsyncStorage.getItem(key);
      presets[key.replace("preset_", "")] = value ? JSON.parse(value) : [];
    }
    return presets;
  } catch (error) {
    console.error("Error getting saved presets:", error);
    return {};
  }
};

export const getSavedPresetByTitle = async (presetTitle) => {
  try {
    const presetKey = `preset_${presetTitle}`;
    const value = await AsyncStorage.getItem(presetKey);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error("Error getting preset by title:", error);
    return [];
  }
};

export const removePresetById = async (id) => {
  try {
    const presetKey = `preset_${id}`;
    await AsyncStorage.removeItem(presetKey);
  } catch (error) {
    console.error("Error removing preset:", error);
  }
};

export const saveCompletedExercises = async (exercises) => {
  try {
    await AsyncStorage.setItem(
      COMPLETED_EXERCISES_KEY,
      JSON.stringify(exercises),
    );
  } catch (error) {
    console.error("Error saving completed exercises:", error);
    throw error;
  }
};

export const saveWeightProgressionByExerciseName = async (
  exerciseName,
  weight,
) => {
  try {
    const key = `weightProgression_${exerciseName}`;

    const existingValue = await AsyncStorage.getItem(key);
    const history = existingValue ? JSON.parse(existingValue) : [];

    const highestWeight = Math.max(...weight.map(parseFloat));

    console.log("highest weight:", highestWeight);

    const newEntry = {
      date: new Date().toISOString().split("T")[0],
      weight: parseFloat(highestWeight),
    };

    console.log(`weight: ${weight} newEntry: ${newEntry}`);

    history.push(newEntry);

    console.log("history:", history);
    await AsyncStorage.setItem(key, JSON.stringify(history));
  } catch (error) {
    console.error("Error saving weight progression:", error);
  }
};

export const getWeightProgressionByExerciseName = async (exerciseName) => {
  try {
    const value = await AsyncStorage.getItem(
      "weightProgression_" + exerciseName,
    );

    return value != null ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Error getting weight progression:", error);
    return null;
  }
};

export const getBestWeightByExerciseName = async (exerciseName) => {
  try {
    const value = await AsyncStorage.getItem(
      "weightProgression_" + exerciseName,
    );
    console.log("value:", value);
    const progression = value != null ? JSON.parse(value) : [];
    console.log("progression:", progression);
    if (progression.length === 0) return null;

    const weights = progression.map((entry) => entry.weight);

    return Math.max(...weights);
  } catch (error) {
    console.error("Error getting best weight:", error);
    return null;
  }
};

export const saveVolumeProgressionByExerciseName = async (
  exerciseName,
  volume,
) => {
  try {
    await AsyncStorage.setItem(
      "volumeProgression_" + exerciseName,
      JSON.stringify(volume),
    );
  } catch (error) {
    console.error("Error saving volume progression:", error);
  }
};

export const getVolumeProgressionByExerciseName = async (exerciseName) => {
  try {
    const value = await AsyncStorage.getItem(
      "volumeProgression_" + exerciseName,
    );
    return value != null ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Error getting volume progression:", error);
    return null;
  }
};

export const getBestVolumeByExerciseName = async (exerciseName) => {
  try {
    const value = await AsyncStorage.getItem(
      "volumeProgression_" + exerciseName,
    );
    const progression = value != null ? JSON.parse(value) : [];
    if (progression.length === 0) return null;
    return Math.max(...progression);
  } catch (error) {
    console.error("Error getting best volume:", error);
  }
};

export const saveCompletedExerciseAsPreset = async (exercises, presetName) => {
  try {
    const presetKey = `preset_${presetName}`;
    await AsyncStorage.setItem(presetKey, JSON.stringify(exercises));
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
    throw error;
  }
};

export const removeCompletedExercise = async (exerciseId) => {
  try {
    const raw = await getCompletedExercises();
    const newRaw = raw.filter((prev) => prev.id !== exerciseId);

    if (newRaw.length !== raw.length) {
      await saveCompletedExercises(newRaw);
      return newRaw;
    } else return null;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

export const debugPrintCompletedExercises = async () => {
  const raw = await AsyncStorage.getItem(COMPLETED_EXERCISES_KEY);
  console.log("Raw completed exercises data:", raw);
  const parsed = raw ? JSON.parse(raw) : [];
  console.log("Parsed completed exercises data:", parsed);
};
